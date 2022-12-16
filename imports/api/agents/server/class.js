import AgentsBoth from "../both/class"
import Frames from "../../frames/server/class"
import Materials from "../../materials/both/class"
import Sceneries from "../../sceneries/server/class"
import Simulations from "../../simulations/server/class"

export default class Agents extends AgentsBoth {
  static start(agentId) {
    const agent = Agents.findOne(agentId)

    AgentsBoth.updateObj({ _id: agentId, iteration: agent.iteration + 1 })
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

  static removeByOwner(owner) {
    const agents = AgentsBoth.find({ owner: owner }).fetch()

    agents.forEach(agent => {
      Simulations.remove(agent.current.simulation)
      Simulations.remove(agent.best.simulation)
    })

    const agentIds = agents.map(agent => agent._id)
    AgentsBoth.remove({ _id: { $in: agentIds } })
  }

  static observe(agentId, callback) {
    const agent = AgentsBoth.findOne(agentId)

    const agentObserve = AgentsBoth.find({ _id: agentId }).observe({
      changed: newDocument => callback("agent", agentId, newDocument),
    })

    const simulationObserve = Simulations.find({ _id: agent.current.simulation }).observe({
      changed: newDocument => callback("simulation", agentId, newDocument),
    })

    const simulation = Simulations.findOne(agent.current.simulation)
    const scenery = Sceneries.findOne({ owner: simulation._id })

    const frameObserve = Frames.find({ owner: scenery._id }).observe({
      added: newDocument => callback("frame", agentId, newDocument),
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
    let agent = Agents.findOne(agentId)

    // If the current agent's simulation is better than the best agent's simulation, then the best agent's simulation
    // object is updated with the current agent's object
    if (agent.current.score < agent.best.score) {
      // Clones the current simulation (thus, scenery and materials).
      const newBestSimulationId = Simulations.clone(agent.current.simulation, false)

      // Removes the old best simulation
      Simulations.remove(agent.best.simulation)

      // Updates the best object with the new best simulation id and its score.
      Agents.updateObj({ _id: agentId, best: { score: agent.current.score, simulation: newBestSimulationId } })
    }

    Simulations.reset(agent.current.simulation)

    const scenery = Sceneries.findOne({ owner: agent.current.simulation })
    const materials = Materials.find({ owner: scenery._id }).fetch()

    if (agent.current.score < agent.best.score) {
      Agents.updateObj({ _id: agentId, best: agent.current })
    }

    // Read the agent again from the database, because it may have been updated.
    agent = Agents.findOne(agentId)

    const bestScenery = Sceneries.findOne({ owner: agent.best.simulation })
    const bestMaterials = Materials.find({ owner: bestScenery._id }).fetch()

    const bestGAgent = Agents.findOne(bestGAgentId)
    const bestGScenery = Sceneries.findOne({ owner: bestGAgent.best.simulation })
    const bestGMaterials = Materials.find({ owner: bestGScenery._id }).fetch()

    updateMaterials(materials, bestMaterials, bestGMaterials)
    Agents.updateObj({ _id: agentId, iteration: agent.iteration + 1 })

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

        function calculateCoefficient(coefficient, bestCoefficient, bestGlobalCoefficient) {
          const random1 = Math.random()
          const random2 = Math.random()

          const c1 = 0.2
          const c2 = 0.8

          const velocity = bestCoefficient - coefficient
          const globalVelocity = bestGlobalCoefficient - coefficient

          return coefficient + c1 * random1 * velocity + c2 * random2 * globalVelocity
        }

        Materials.updateObj({
          _id: material._id,
          coefficients: newCoefficients,
          dragCoefficients: newDragCoefficients,
        })
      })
    }
  }
}
