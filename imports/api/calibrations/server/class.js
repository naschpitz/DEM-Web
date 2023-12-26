import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class"
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

    CalibrationsBoth.updateObj({ _id: calibrationId, state: "paused" })

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => {
      const state = Agents.getState(agent._id)

      if (state === "running") Agents.pause(agent._id)
    })
  }

  static stop(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)
    const state = calibration.state

    if (state !== "paused" && state !== "running")
      throw { message: "Only paused or running calibrations can be stopped" }

    CalibrationsBoth.updateObj({ _id: calibrationId, state: "stopped" })

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => {
      const state = Agents.getState(agent._id)

      if (state === "running" || state === "paused") Agents.stop(agent._id)
    })
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
    // Update Agents' scores
    Agents.updateScores(calibrationId)

    const calibration = CalibrationsBoth.findOne(calibrationId)
    const agents = Agents.find({ owner: calibrationId })

    const bestGAgent = Agents.getBestGlobal(calibrationId)

    if (calibration.currentIteration < calibration.maxIterations - 1) {
      agents.forEach(agent => Agents.nextIteration(agent._id, bestGAgent._id))

      CalibrationsBoth.updateObj({ _id: calibration._id, currentIteration: calibration.currentIteration + 1 })
    } else {
      agents.forEach(agent => Agents.saveHistory(agent._id))

      Calibrations.setState(calibrationId, "done")
    }
  }

  static getNumRunningAgents(calibrationId) {
    const agents = Agents.find({ owner: calibrationId }).fetch()

    return agents.reduce((acc, agent) => {
      const state = Agents.getState(agent._id)
      return state === "setToRun" || state === "running" ? acc + 1 : acc
    }, 0)
  }

  static observe(calibrationId, callback) {
    return CalibrationsBoth.find({ _id: calibrationId }).observe({
      changed: calibration => callback(calibration),
    })
  }
}
