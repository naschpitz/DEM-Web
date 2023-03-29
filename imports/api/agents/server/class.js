import AgentsBoth from "../both/class"
import DataSets from "../../dataSets/both/class"
import Frames from "../../frames/server/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Sceneries from "../../sceneries/server/class"
import Simulations from "../../simulations/server/class"
import SolidObjects from "../../solidObjects/both/class"

import Spline from "cubic-spline"
import _ from "lodash"

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

      // If the current agent's simulation is better than the best agent's simulation or if it is the first iteration,
      // then the best agent's simulation object is updated with the current agent's object
      if (agent.current.score < agent.best.score || agent.iteration === 0) {
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

    let agent = Agents.findOne(agentId)

    Simulations.reset(agent.current.simulation)

    const scenery = Sceneries.findOne({ owner: agent.current.simulation })
    const solidObjects = SolidObjects.find({ owner: scenery._id, fixed: true }).fetch()
    const nonSolidObjects = NonSolidObjects.find({ owner: scenery._id, fixed: true }).fetch()
    const materials = Materials.find({ owner: scenery._id }).fetch()

    // Read the agent again from the database, because it might have been updated.
    agent = Agents.findOne(agentId)

    const bestScenery = Sceneries.findOne({ owner: agent.best.simulation })
    const bestSolidObjects = SolidObjects.find({ owner: bestScenery._id, fixed: true }).fetch()
    const bestNonSolidObjects = NonSolidObjects.find({ owner: bestScenery._id, fixed: true }).fetch()
    const bestMaterials = Materials.find({ owner: bestScenery._id }).fetch()

    const bestGAgent = Agents.findOne(bestGAgentId)
    const bestGScenery = Sceneries.findOne({ owner: bestGAgent.best.simulation })
    const bestGSolidObjects = SolidObjects.find({ owner: bestGScenery._id, fixed: true }).fetch()
    const bestGNonSolidObjects = NonSolidObjects.find({ owner: bestGScenery._id, fixed: true }).fetch()
    const bestGMaterials = Materials.find({ owner: bestGScenery._id }).fetch()

    updateSolidObjects(solidObjects, bestSolidObjects, bestGSolidObjects)
    updateNonSolidObjects(nonSolidObjects, bestNonSolidObjects, bestGNonSolidObjects)
    updateMaterials(materials, bestMaterials, bestGMaterials)

    Agents.updateObj({ _id: agentId, iteration: agent.iteration + 1 })

    function updateSolidObjects(solidObjects, bestSolidObjects, bestGSolidObjects) {
      solidObjects.forEach(solidObject => {
        const bestSolidObject = bestSolidObjects.find(
          bestSolidObject => bestSolidObject.callSign === solidObject.callSign
        )

        const bestGSolidObject = bestGSolidObjects.find(
          bestGSolidObject => bestGSolidObject.callSign === solidObject.callSign
        )

        const newMass = calculateCoefficient(solidObject.mass, bestSolidObject.mass, bestGSolidObject.mass)

        SolidObjects.updateObj({ _id: solidObject._id, mass: newMass })
      })
    }

    function updateNonSolidObjects(nonSolidObjects, bestNonSolidObjects, bestGNonSolidObjects) {
      nonSolidObjects.forEach(nonSolidObject => {
        const bestNonSolidObject = bestNonSolidObjects.find(
          bestNonSolidObject => bestNonSolidObject.callSign === nonSolidObject.callSign
        )

        const bestGNonSolidObject = bestGNonSolidObjects.find(
          bestGNonSolidObject => bestGNonSolidObject.callSign === nonSolidObject.callSign
        )

        const newDensity = calculateCoefficient(
          nonSolidObject.density,
          bestNonSolidObject.density,
          bestGNonSolidObject.density
        )

        NonSolidObjects.updateObj({ _id: nonSolidObject._id, density: newDensity })
      })
    }

    function updateMaterials(materials, bestMaterials, bestGMaterials) {
      materials.forEach(material => {
        const bestMaterial = bestMaterials.find(bestMaterial => bestMaterial.callSign === material.callSign)
        const bestGMaterial = bestGMaterials.find(bestGMaterial => bestGMaterial.callSign === material.callSign)

        const newCoefficients = material.coefficients?.map((coefficient, index) => {
          const bestCoefficient = bestMaterial.coefficients[index]
          const bestGCoefficient = bestGMaterial.coefficients[index]

          return calculateCoefficient(coefficient, bestCoefficient, bestGCoefficient)
        })

        const newDragCoefficients = material.dragCoefficients?.map((dragCoefficient, index) => {
          const bestDragCoefficient = bestMaterial.dragCoefficients[index]
          const bestGDragCoefficient = bestGMaterial.dragCoefficients[index]

          return calculateCoefficient(dragCoefficient, bestDragCoefficient, bestGDragCoefficient)
        })

        Materials.updateObj({
          _id: material._id,
          coefficients: newCoefficients,
          dragCoefficients: newDragCoefficients,
        })
      })
    }

    function calculateCoefficient(coefficient, bestCoefficient, bestGlobalCoefficient) {
      const random1 = Math.random()
      const random2 = Math.random()

      const c1 = 0.2
      const c2 = 0.8

      let velocity = bestCoefficient - coefficient
      if (velocity < 0.1 * coefficient) velocity = 0.1 * bestCoefficient

      let globalVelocity = bestGlobalCoefficient - coefficient
      if (globalVelocity < 0.1 * coefficient) globalVelocity = 0.1 * bestGlobalCoefficient

      return coefficient + c1 * random1 * velocity + c2 * random2 * globalVelocity
    }
  }
}
