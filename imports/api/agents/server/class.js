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

  static saveHistory(agentId) {
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

  static updateScores(calibrationId) {
    const agents = AgentsBoth.find({ owner: calibrationId })

    agents.forEach(agent => {
      updateCurrentScore(agent._id)
      updateBestScore(agent._id)
    })

    Agents.updateBestGlobal(calibrationId)

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

      let currentScore = 0

      DataSets.find({ owner: agent.owner }).forEach(dataSet => {
        const objectId = dataSet.object
        const object = NonSolidObjects.findOne(objectId) || SolidObjects.findOne(objectId)

        const objectCallSign = object.callSign
        const dataName = dataSet.dataName

        const spline = new Spline(
          dataSet.data.map(data => data.time),
          dataSet.data.map(data => data.value)
        )

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

          // Calculate the difference between the value and the expected value
          const evaluatedValue = spline.at(frame.time)

          // If evaluatedValue is NaN, it means that the frame time is out of the DataSet's time range. In this case, the
          // error is 0.
          const error = isNaN(evaluatedValue) ? 0 : Math.abs(value - evaluatedValue)

          return score + error
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
  }

  static updateBestGlobal(calibrationId) {
    const bestGScores = Agents.find({ owner: calibrationId, "best.valid": true }).map(agent => ({
      agentId: agent._id,
      score: agent.best.score,
    }))

    // Gets the agentId with the lowest score
    const bestGAgentId = bestGScores.reduce(
      (acc, score) => (score.score < acc.score ? score : acc),
      bestGScores[0]
    ).agentId

    Agents.setBestGlobal(bestGAgentId)
  }

  static nextIteration(agentId, bestGAgentId) {
    Agents.saveHistory(agentId)

    const agent = Agents.findOne(agentId)
    const bestGAgent = Agents.findOne(bestGAgentId)

    Simulations.reset(agent.current.simulation)

    updateCoefficients(agent, bestGAgent)

    Agents.updateObj({ _id: agentId, iteration: agent.iteration + 1 })

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
            parameter.c2
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
            parameter.c2
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
            parameter.c2
          )

          _.set(currentSO, coefficient, value)
          SolidObjects.updateObj(currentSO)

          break
        }
      }
    }

    function calculateCoefficient(coefficient, bestCoefficient, bestGlobalCoefficient, c1, c2) {
      const random1 = Math.random()
      const random2 = Math.random()

      const bestVelocity = bestCoefficient - coefficient
      const bestGlobalVelocity = bestGlobalCoefficient - coefficient

      return coefficient + c1 * random1 * bestVelocity + c2 * random2 * bestGlobalVelocity
    }
  }
}
