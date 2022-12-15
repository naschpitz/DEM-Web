import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class.js"
import Hypervisor from "./hypervisor"
import Logs from "../../logs/both/class"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {
    const hypervisor = new Hypervisor(calibrationId)

    try {
      hypervisor.initialize()
    } catch (error) {
      console.log(error)
    }

    CalibrationsBoth.updateObj({ _id: calibrationId, state: "running" })
  }

  static pause(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)
    const state = calibration.state

    if (state !== "running") throw { message: "Only running calibrations can be paused" }

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => {
      const state = Agents.getState(agent._id)

      if (state === "running") Agents.pause(agent._id)
    })

    CalibrationsBoth.updateObj({ _id: calibrationId, state: "paused" })
  }

  static stop(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)
    const state = calibration.state

    if (state !== "paused" && state !== "running")
      throw { message: "Only paused or running calibrations can be stopped" }

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => {
      const state = Agents.getState(agent._id)

      if (state === "running" || state === "paused") Agents.stop(agent._id)
    })

    CalibrationsBoth.updateObj({ _id: calibrationId, state: "stopped" })
  }

  static reset(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)
    const state = calibration.state

    if (state === "running" || state === "paused") throw { message: "Running or paused calibration cannot be reset" }

    Logs.removeByOwner(calibrationId)
    Agents.removeByOwner(calibrationId)

    CalibrationsBoth.updateObj({ _id: calibrationId, state: "new", currentIteration: 0 })
  }

  static nextIteration(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => Agents.updateCurrentScore(agent._id))

    const bestGScores = agents.map(agent => ({ agentId: agent._id, score: agent.best.score }))

    // Gets the agentId with the lowest score
    const bestGAgentId = bestGScores.reduce(
      (acc, score) => (score.score < acc.score ? score : acc),
      bestGScores[0]
    ).agentId

    agents.forEach(agent => Agents.nextIteration(agent._id, bestGAgentId))

    CalibrationsBoth.updateObj({ _id: calibration._id, currentIteration: calibration.currentIteration + 1 })
  }

  static getNumRunningAgents(calibrationId) {
    const agents = Agents.find({ owner: calibrationId }).fetch()

    return agents.reduce((acc, agent) => (Agents.getState(agent._id) === "running" ? acc + 1 : acc), 0)
  }

  static observe(calibrationId, callback) {
    return CalibrationsBoth.find({ _id: calibrationId }).observe({
      changed: result => callback(result),
    })
  }
}
