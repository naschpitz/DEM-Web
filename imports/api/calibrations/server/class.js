import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class.js"
import DataSets from "../../dataSets/both/class"
import Hypervisor from "./hypervisor"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {
    new Hypervisor(calibrationId)

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

  static removeByOwner(simulationId) {
    const calibration = CalibrationsBoth.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    CalibrationsBoth.remove(calibration._id)
  }

  static nextIteration(calibrationId) {
    const calibration = CalibrationsBoth.findOne(calibrationId)

    CalibrationsBoth.updateObj({ _id: calibration._id, currentIteration: calibration.currentIteration + 1 })
  }

  static getNumRunningAgents(calibrationId) {
    const agents = Agents.find({ owner: calibrationId })

    return agents.reduce((acc, agent) => (Agents.getState(agent._id) === "running" ? acc + 1 : acc), 0)
  }

  static observe(calibrationId, callback) {
    return CalibrationsBoth.find({ _id: calibrationId }).observe({
      changed: result => callback("calibration", result),
    })
  }
}
