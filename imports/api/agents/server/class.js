import AgentsBoth from "../both/class"
import Simulations from "../../simulations/server/class"

export default class Agents extends AgentsBoth {
  static start(agentId) {
    const agent = Agents.findOne(agentId)

    AgentsBoth.updateObj({ _id: agentId, iteration: agent.iteration + 1 })
    Simulations.start(agent.simulation)
  }

  static pause(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    Simulations.pause(agent.simulation)
  }

  static stop(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    Simulations.stop(agent.simulation)
  }

  static reset(agentId) {
    const agent = AgentsBoth.findOne(agentId)

    AgentsBoth.updateObj({ _id: agentId, iteration: 0 })
    Simulations.reset(agent.simulation)
  }

  static observe(agentId, callback) {
    const agent = AgentsBoth.findOne(agentId)

    const agentObserve = AgentsBoth.find({ _id: agentId }).observe({
      changed: result => callback("agent", result),
    })
    const simulationObserve = Simulations.find({ _id: agent.simulation }).observe({
      changed: result => callback("simulation", result),
    })

    return {
      agentObserve: agentObserve,
      simulationObserve: simulationObserve,
      stop() {
        agentObserve.stop()
        simulationObserve.stop()
      },
    }
  }
}
