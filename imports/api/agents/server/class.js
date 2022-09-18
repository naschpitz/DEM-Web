import AgentsBoth from "../both/class"
import Simulations from "../../simulations/server/class"

export default class Agents extends AgentsBoth {
  static start(agentId) {
    const agent = Agents.findOne(agentId)

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

    Simulations.reset(agent.simulation)
  }
}
