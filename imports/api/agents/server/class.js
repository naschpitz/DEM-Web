import AgentsBoth from "../both/class"
import Frames from "../../frames/server/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
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
      const globalVelocity = bestGlobalCoefficient - coefficient

      return coefficient + c1 * random1 * velocity + c2 * random2 * globalVelocity
    }
  }
}
