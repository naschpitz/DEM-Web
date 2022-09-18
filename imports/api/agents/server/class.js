import AgentsBoth from "../both/class"
import Simulations from "../../simulations/server/class"

export default class Agents extends AgentsBoth {
  static start(agentId) {
    const agent = Agents.findOne(agentId)

    AgentsBoth.update(agentId, { iteration: agent.iteration + 1 })
    Simulations.start(agent.simulation)
  }

  static pause(agentId) {
    const agent = Agents.findOne(agentId)

    Simulations.pause(agent.simulation)
  }

  static stop(agentId) {
    const agent = Agents.findOne(agentId)

    Simulations.stop(agent.simulation)
  }

  static reset(agentId) {
    const agent = Agents.findOne(agentId)

    AgentsBoth.update(agentId, { iteration: 0 })
    Simulations.reset(agent.simulation)
  }

  static observe(agentId, callback) {
    const agent = Agents.findOne(agentId)

    const agentObserve = AgentsBoth.find({ _id: agentId }).observe({ changed: callback })
    const simulationObserve = Simulations.find({ _id: agent.simulation }).observe({ changed: callback })

    return {
      stop() {
        agentObserve.stop()
        simulationObserve.stop()
      },
    }
  }
}
