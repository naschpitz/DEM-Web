import Spline from "cubic-spline"
import _ from "lodash"

import AgentsBoth from "../both/class"
import DataSets from "../../dataSets/both/class"
import Frames from "../../frames/server/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Parameters from "../../parameters/both/class"
import Sceneries from "../../sceneries/server/class"
import Simulations from "../../simulations/server/class"
import SolidObjects from "../../solidObjects/both/class"

export default class Agents extends AgentsBoth {
  static start(agentId) {
    const agent = Agents.findOne(agentId)

    Simulations.start(agent.current.simulation)
  }

  static pause(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    Simulations.pause(agent.current.simulation)
  }

  static stop(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    Simulations.stop(agent.current.simulation)
  }

  static reset(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    AgentsBoth.updateObj({ _id: agentId, iteration: 0 })
    Simulations.reset(agent.current.simulation)
  }

  static retry(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    Simulations.reset(agent.current.simulation)
    Simulations.start(agent.current.simulation)
  }

  static removeByOwner(owner) {
    const agents = AgentsBoth.find({ owner: owner }).fetch()

    agents.forEach(agent => {
      Simulations.remove(agent.current.simulation)
      Simulations.remove(agent.best.simulation)

      agent.history.forEach(history => {
        Simulations.remove(history.current.simulation)
        Simulations.remove(history.best.simulation)
      })
    })

    const agentIds = agents.map(agent => agent._id)
    AgentsBoth.remove({ _id: { $in: agentIds } })
  }

  static setBestGlobal(agentId) {
    // Get this agent based on the 'agentId'
    const agent = AgentsBoth.findOne(agentId)

    // Get the other agents with the same 'agent.owner' and set their 'bestGlobal' to false
    AgentsBoth.update({ owner: agent.owner }, { $set: { "best.bestGlobal": false } }, { multi: true })

    AgentsBoth.updateObj({ _id: agentId, "best.bestGlobal": true })
  }

  static getBestGlobal(calibrationId) {
    return AgentsBoth.findOne({ owner: calibrationId, "best.bestGlobal": true })
  }

  static async saveAllHistories(calibrationId) {
    const agents = AgentsBoth.find({ owner: calibrationId })

    const saveHistoryPromises = agents.map(agent => Agents.saveHistory(agent._id))
    await Promise.all(saveHistoryPromises)
  }

  static async saveHistory(agentId) {
    return new Promise((resolve) => {
      const agent = AgentsBoth.findOne(agentId)

      const best = { ...agent.best }
      best.simulation = Simulations.clone(agent.best.simulation, false, true, true)

      const current = { ...agent.current }
      current.simulation = Simulations.clone(agent.current.simulation, false, true, true)

      const history = {
        iteration: agent.iteration,
        best: best,
        current: current,
      }

      AgentsBoth.update(agentId, { $push: { history: history } })
      resolve()
    })
  }

  static observe(agentId, callback) {
    const agent = AgentsBoth.findOne(agentId)

    const agentObserve = AgentsBoth.find({ _id: agentId }).observe({
      changed: agent => callback("agent", agentId, agent),
    })

    const simulationObserve = Simulations.find({ _id: agent.current.simulation }).observe({
      changed: simulation => callback("simulation", agentId, simulation),
    })

    const simulation = Simulations.findOne(agent.current.simulation)
    const scenery = Sceneries.findOne({ owner: simulation._id })

    const frameObserve = Frames.find({ owner: scenery._id }).observe({
      added: frame => callback("frame", agentId, frame),
    })

    return {
      agentObserve: agentObserve,
      frameObserve: frameObserve,
      simulationObserve: simulationObserve,
      stop() {
        agentObserve.stop()
        frameObserve.stop()
        simulationObserve.stop()
      },
    }
  }

  static async updateAllScores(calibrationId) {
    const agents = AgentsBoth.find({ owner: calibrationId })

    const scoresPromises = agents.map(agent => updateScores(agent._id))
    await Promise.all(scoresPromises)

    Agents.updateBestGlobal(calibrationId)

    async function updateScores(agentId) {
      return new Promise((resolve) => {
        updateCurrentScore(agentId)
        updateBestScore(agentId)
        resolve()
      })
    }

    function updateCurrentScore(agentId) {
      const state = Agents.getState(agentId)

      if (state !== "done") {
        Agents.updateObj({ _id: agentId, current: { valid: false } })
        return
      }

      const agent = Agents.findOne(agentId)
      const simulation = Simulations.findOne(agent.current.simulation)
      const scenery = Sceneries.findOne({ owner: simulation._id })

      const frames = Frames.find({ owner: scenery._id }, { sort: { time: 1 } }).fetch()

      // Sanity check: calculate the expected number of frames for the scenery.
      // The expected number of frames is the total time of the simulation divided by the frame time, rounded to the
      // nearest integer, plus 1. Plus 1 because the first frame is at time 0.
      const expectedFrames = Math.round(simulation.totalTime / simulation.frameTime) + 1

      // If the number of frames is different from the expected number of frames, then the current simulation is not
      // valid. This will prevent the agent from being considered for the best global agent, as its score will be 0,
      // since there are no frames to evaluate.
      if (frames.length !== expectedFrames) {
        Agents.updateObj({ _id: agentId, current: { valid: false } })
        return
      }

      let currentScore = 0

      DataSets.find({ owner: agent.owner, enabled: true }).forEach(dataSet => {
        const objectId = dataSet.object
        const object = NonSolidObjects.findOne(objectId) || SolidObjects.findOne(objectId)

        const objectCallSign = object.callSign
        const dataName = dataSet.dataName

        const spline = new Spline(
          dataSet.data.map(data => data.time),
          dataSet.data.map(data => data.value)
        )

        const hasCondition = dataSet.startCondition && dataSet.startThreshold
        let conditionMet = false
        let startedAt = 0

        currentScore += frames.reduce((score, frame) => {
          // Get the non-solid or solid object that belongs to the Frame's Scenery and has the same callSign as the DataSet's
          const nonSolidObject = NonSolidObjects.findOne({ owner: frame.owner, callSign: objectCallSign })
          const solidObject = SolidObjects.findOne({ owner: frame.owner, callSign: objectCallSign })

          const object = nonSolidObject || solidObject

          // Find in the frame object's list the one that matches the id of the object found above
          const frameNonSolidObject = _.find(frame.scenery.objects.nonSolidObjects, { _id: object._id })
          const frameSolidObject = _.find(frame.scenery.objects.solidObjects, { _id: object._id })

          const frameObject = frameNonSolidObject || frameSolidObject

          // Get the value of the dataName in the frame object
          const value = _.get(frameObject, dataName)

          if (hasCondition) {
            const startConditionMet = assessStartCondition(dataSet.startCondition, dataSet.startThreshold, value)

            // If the start condition is met and the condition is not met, then the startAt is set to the current frame time.
            if (startConditionMet && !conditionMet) {
              startedAt = frame.time
              conditionMet = true
            }
          }

          // If the start condition is not met, then the score is 0, thus it won't be penalized.
          if (hasCondition && !conditionMet) return 0;

          // Evaluate the spline at the frame time, displacing it by the startAt time.
          const refValue = spline.at(frame.time - startedAt)

          // Initialize the error to 0
          let error = 0

          // If the refValue is not NaN, which means it is inside the spline range, and it is not 0, then the error
          // is calculated. Otherwise, the error is 0.
          if (!isNaN(refValue) && refValue !== 0) {
            error = Math.abs((value - refValue) / refValue)
          }

          return score + (error * dataSet.weight)
        }, 0)
      })

      Agents.updateObj({ _id: agentId, current: { score: currentScore, valid: true } })
    }

    function updateBestScore(agentId) {
      const agent = Agents.findOne(agentId)

      if (!agent.current.valid) return

      // If the current agent's simulation is better than the best agent's simulation or if it does not have a valid
      // best score, then the best agent's simulation object is updated with the current agent's object
      if (agent.current.score < agent.best.score || !agent.best.valid) {
        // Clones the current simulation (thus, scenery and materials).
        const newBestSimulationId = Simulations.clone(agent.current.simulation, false)

        // Removes the old best simulation
        Simulations.remove(agent.best.simulation)

        // Updates the best object with the new best simulation id and its score.
        Agents.updateObj({
          _id: agentId,
          best: { score: agent.current.score, simulation: newBestSimulationId, valid: true },
        })
      }
    }

    function assessStartCondition(startCondition, startThreshold, value) {
      switch (startCondition) {
        case "lt":
          return value < startThreshold
        case "lte":
          return value <= startThreshold
        case "eq":
          return value === startThreshold
        case "gte":
          return value >= startThreshold
        case "gt":
          return value > startThreshold
        default:
          return false
      }
    }
  }

  static updateBestGlobal(calibrationId) {
    const bestScores = Agents.find({ owner: calibrationId, "best.valid": true }).map(agent => ({
      agentId: agent._id,
      score: agent.best.score,
    }))

    // If no valid best scores are found, then the best global agent is not updated.
    if (bestScores.length === 0) return

    // Gets the agentId with the lowest score
    const bestGAgentId = bestScores.reduce(
      (acc, score) => (score.score < acc.score ? score : acc),
      bestScores[0]
    ).agentId

    Agents.setBestGlobal(bestGAgentId)
  }

  static async nextAllIterations(calibrationId) {
    const agents = Agents.find({ owner: calibrationId })
    const bestGAgent = Agents.getBestGlobal(calibrationId)

    // TODO: What if there is no bestGAgent, because no agent has a valid best score?

    const nextIterationsPromises = agents.map(agent => Agents.nextIteration(agent._id, bestGAgent._id))
    await Promise.all(nextIterationsPromises)
  }

  static async nextIteration(agentId, bestGAgentId) {
    return new Promise(async (resolve) => {
      await Agents.saveHistory(agentId)

      const agent = Agents.findOne(agentId)
      const bestGAgent = Agents.findOne(bestGAgentId)

      Simulations.reset(agent.current.simulation)

      updateCoefficients(agent, bestGAgent)

      Agents.updateObj({ _id: agentId, iteration: agent.iteration + 1 })
      resolve()
    })

    function updateCoefficients(agent, bestGAgent) {
      const calibrationId = agent.owner

      Parameters.find({ owner: calibrationId }).forEach(parameter => updateCoefficient(parameter, agent, bestGAgent))
    }

    function updateCoefficient(parameter, agent, bestGAgent) {
      const scenery = Sceneries.findOne({ owner: agent.current.simulation })
      const bestScenery = Sceneries.findOne({ owner: agent.best.simulation })
      const bestGScenery = Sceneries.findOne({ owner: bestGAgent.best.simulation })

      switch (parameter.type) {
        case "material": {
          const referenceMaterial = Materials.findOne(parameter.materialObject)
          const currentMaterial = Materials.findOne({ owner: scenery._id, callSign: referenceMaterial.callSign })
          const bestMaterial = Materials.findOne({ owner: bestScenery._id, callSign: referenceMaterial.callSign })
          const bestGMaterial = Materials.findOne({ owner: bestGScenery._id, callSign: referenceMaterial.callSign })

          const coefficient = parameter.coefficient

          const value = calculateCoefficient(
            _.get(currentMaterial, coefficient),
            _.get(bestMaterial, coefficient),
            _.get(bestGMaterial, coefficient),
            parameter.c1,
            parameter.c2,
            parameter.perturbation
          )

          _.set(currentMaterial, coefficient, value)
          Materials.updateObj(currentMaterial)

          break
        }
        case "nonSolidObject": {
          const referenceNSO = NonSolidObjects.findOne(parameter.materialObject)
          const currentNSO = NonSolidObjects.findOne({ owner: scenery._id, callSign: referenceNSO.callSign })
          const bestNSO = NonSolidObjects.findOne({ owner: bestScenery._id, callSign: referenceNSO.callSign })
          const bestGNSO = NonSolidObjects.findOne({ owner: bestGScenery._id, callSign: referenceNSO.callSign })

          const coefficient = parameter.coefficient
          const value = calculateCoefficient(
            _.get(currentNSO, coefficient),
            _.get(bestNSO, coefficient),
            _.get(bestGNSO, coefficient),
            parameter.c1,
            parameter.c2,
            parameter.perturbation
          )

          _.set(currentNSO, coefficient, value)
          NonSolidObjects.updateObj(currentNSO)

          break
        }
        case "solidObject": {
          const referenceSO = SolidObjects.findOne(parameter.materialObject)
          const currentSO = SolidObjects.findOne({ owner: scenery._id, callSign: referenceSO.callSign })
          const bestSO = SolidObjects.findOne({ owner: bestScenery._id, callSign: referenceSO.callSign })
          const bestGSO = SolidObjects.findOne({ owner: bestGScenery._id, callSign: referenceSO.callSign })

          const coefficient = parameter.coefficient
          const value = calculateCoefficient(
            _.get(currentSO, coefficient),
            _.get(bestSO, coefficient),
            _.get(bestGSO, coefficient),
            parameter.c1,
            parameter.c2,
            parameter.perturbation
          )

          _.set(currentSO, coefficient, value)
          SolidObjects.updateObj(currentSO)

          break
        }
      }
    }

    function calculateCoefficient(coefficient, bestCoefficient, bestGlobalCoefficient, c1, c2, perturbation) {
      const random1 = Math.random()
      const random2 = Math.random()

      let bestVelocity = bestCoefficient - coefficient

      if (bestVelocity === 0)
        bestVelocity = (Math.random() - 0.5) * perturbation * coefficient

      let bestGlobalVelocity = bestGlobalCoefficient - coefficient

      if (bestGlobalVelocity === 0)
        bestGlobalVelocity = (Math.random() - 0.5) * perturbation * coefficient

      return coefficient + c1 * random1 * bestVelocity + c2 * random2 * bestGlobalVelocity
    }
  }
}
