import Spline from "cubic-spline"
import _ from "lodash"

import AgentsBoth from "../both/class"
import AgentsHistories from "../../agentsHistories/both/class"
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

      const agentsHistories = AgentsHistories.find({ owner: agent._id })

      agentsHistories.forEach(agentHistory => {
        Simulations.remove(agentHistory.current.simulation)
        Simulations.remove(agentHistory.best.simulation)
      })

      AgentsHistories.removeByOwner(agent._id)
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

  static async saveAllAgentsHistories(calibrationId) {
    const agents = AgentsBoth.find({ owner: calibrationId })

    const saveAgentsHistoryPromises = agents.map(agent => Agents.saveAgentHistory(agent._id))
    await Promise.all(saveAgentsHistoryPromises)
  }

  static async saveAgentHistory(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    const best = { ...agent.best }
    best.simulation = await Simulations.clone(agent.best.simulation, false, true, true)

    const current = { ...agent.current }
    current.simulation = await Simulations.clone(agent.current.simulation, false, true, true)

    const agentHistory = {
      owner: agentId,
      iteration: agent.iteration,
      best: best,
      current: current,
    }

    AgentsHistories.insert(agentHistory)
  }

  static observe(agentId, callback) {
    const agent = AgentsBoth.findOne(agentId)

    const agentObserve = AgentsBoth.find({ _id: agentId }).observe({
      changed: (agentNew, agentOld) => callback("agent", agentId, agentNew, agentOld),
    })

    const simulationObserve = Simulations.find({ _id: agent.current.simulation }).observe({
      changed: (simulationNew, simulationOld) => callback("simulation", agentId, simulationNew, simulationOld),
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
      updateCurrentScore(agentId)
      await updateBestScore(agentId)
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

      const frames = Frames.find({ owner: scenery._id }, { sort: { step: 1 } }).fetch()
      const dataSets = DataSets.find({ owner: agent.owner, enabled: true }).fetch()

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

      const dataSetsEvaluations = []

      const currentScore = dataSets.reduce((score, dataSet) => {
        const objectId = dataSet.object
        const object = NonSolidObjects.findOne(objectId) || SolidObjects.findOne(objectId)

        const objectCallSign = object.callSign
        const dataName = dataSet.dataName

        const spline = new Spline(
          dataSet.data.map(data => data.time),
          dataSet.data.map(data => data.value)
        )

        const minTime = dataSet.data[0].time
        const maxTime = dataSet.data[dataSet.data.length - 1].time

        const hasCondition = dataSet.startCondition && dataSet.startThreshold
        let conditionMet = false

        let startedAt = 0
        let numFrames = 0

        const referenceData = []
        const simulationData = []
        const errorData = []

        const dataSetScore = frames.reduce((score, frame) => {
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
          if (hasCondition && !conditionMet) return 0

          // The current time is the frame time minus the startAt time.
          const currentTime = frame.time - startedAt

          // If the time of the frame is not between the minTime and the maxTime of the DataSet, then the score is 0.
          if (currentTime < minTime || currentTime > maxTime) return 0

          // Evaluate the spline at the current time to get the reference value.
          const refValue = spline.at(currentTime)

          // Initialize the error to 0
          let error = 0

          // If the reference value is not 0, then the error is calculated as the difference between
          // the value and the reference value divided by the reference value, multiplied by 100, so it is a percentage,
          // and then squared, to penalize errors larger than 1%.
          if (refValue !== 0) {
            error = (((value - refValue) / refValue) * 100) ** 2
          }

          // Increment the number of evaluated frames
          numFrames++

          const weightedError = error * dataSet.weight

          // Add the reference value to referenceData arrays, the value to the simulationData array and the error to the
          // errorData array.
          referenceData.push({ time: currentTime, value: refValue })
          simulationData.push({ time: currentTime, value: value })
          errorData.push({ time: currentTime, value: weightedError })

          // Divide the score by the number of evaluated frames, to get an error number that is not dependent on the
          // number of frames used to evaluate it.
          return (score + weightedError)
        }, 0)

        // Calculate the score of the dataSet by dividing the dataSetScore by the number of frames
        const proportionalScore = numFrames ? (dataSetScore / numFrames) : 0

        // Add the dataSetEvaluations object to the dataSetsEvaluations array
        dataSetsEvaluations.push({
          dataSet: dataSet._id,
          score: proportionalScore,
          referenceData: referenceData,
          simulationData: simulationData,
          errorData: errorData,
        })

        return (score + proportionalScore)
      }, 0)

      Agents.updateObj({
        _id: agentId,
        current: {
          score: currentScore,
          dataSetsEvaluations: dataSetsEvaluations,
          valid: true
        }
      })
    }

    async function updateBestScore(agentId) {
      const agent = Agents.findOne(agentId)

      if (!agent.current.valid) return

      // If the current agent's simulation is better than the best agent's simulation or if it does not have a valid
      // best score, then the best agent's simulation object is updated with the current agent's object
      if (agent.current.score < agent.best.score || !agent.best.valid) {
        // Clones the current simulation (thus, scenery and materials).
        const newBestSimulationId = await Simulations.clone(agent.current.simulation, false)

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
            parameter.perturbation,
            parameter.allowNegative
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
            parameter.perturbation,
            parameter.allowNegative
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
            parameter.perturbation,
            parameter.allowNegative
          )

          _.set(currentSO, coefficient, value)
          SolidObjects.updateObj(currentSO)

          break
        }
      }
    }

    function calculateCoefficient(coefficient, bestCoefficient, bestGlobalCoefficient, c1, c2, perturbation, allowNegative) {
      const random1 = Math.random()
      const random2 = Math.random()

      let bestVelocity = bestCoefficient - coefficient

      if (bestVelocity === 0) {
        if (allowNegative)
          bestVelocity = (Math.random() - 0.5)
        else
          bestVelocity = Math.random()

        bestVelocity *= perturbation * coefficient
      }

      let bestGlobalVelocity = bestGlobalCoefficient - coefficient

      if (bestGlobalVelocity === 0) {
        if (allowNegative)
          bestGlobalVelocity = (Math.random() - 0.5)
        else
          bestGlobalVelocity = Math.random()

        bestGlobalVelocity *= perturbation * coefficient
      }

      return coefficient + c1 * random1 * bestVelocity + c2 * random2 * bestGlobalVelocity
    }
  }
}
