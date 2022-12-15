import AgentsBoth from "../both/class"
import Frames from "../../frames/server/class"
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
      Simulations.remove({ _id: { $in: [agent.current.simulation, agent.best.simulation] } })
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
}
