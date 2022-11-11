import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class.js"
import Hypervisor from "./hypervisor"

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
    CalibrationsBoth.updateObj({ _id: calibrationId, state: "paused" })

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => Agents.pause(agent._id))
  }

  static stop(calibrationId) {
    CalibrationsBoth.updateObj({ _id: calibrationId, state: "stopped" })

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => Agents.stop(agent._id))
  }

  static reset(calibrationId) {
    CalibrationsBoth.updateObj({ _id: calibrationId, state: "new", currentIteration: 0 })

    const agents = Agents.find({ owner: calibrationId })
    agents.forEach(agent => Agents.reset(agent._id))
  }

  static nextIteration(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)

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
