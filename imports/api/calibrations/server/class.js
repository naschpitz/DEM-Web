import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class"
import Hypervisor from "./hypervisor"
import Logs from "../../logs/both/class"
import CalibrationsDAO from "../both/dao";
import DataSets from "../../dataSets/both/class";
import Parameters from "../../parameters/both/class";

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

  static removeByOwner(simulationId) {
    const calibration = CalibrationsDAO.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    Logs.removeByOwner(calibration._id)
    Parameters.removeByOwner(calibration._id)
    Agents.removeByOwner(calibration._id)

    CalibrationsDAO.remove(calibration._id)
  }

  static removeServer(serverId) {
    CalibrationsDAO.update(
      {
        server: serverId,
        state: { $nin: ["paused", "running"] },
      },
      {
        $unset: {
          server: "",
        },
      }
    )
  }

  static async nextIteration(calibrationId) {
    // Update Agents' scores
    await Agents.updateAllScores(calibrationId)

    const calibration = CalibrationsBoth.findOne(calibrationId)

    if (calibration.currentIteration < calibration.maxIterations - 1) {
      await Agents.nextAllIterations(calibrationId)
      CalibrationsBoth.updateObj({ _id: calibration._id, currentIteration: calibration.currentIteration + 1 })
    } else {
      await Agents.saveAllHistories(calibrationId)
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

  static getNumNewAgents(calibrationId) {
    const agents = Agents.find({ owner: calibrationId }).fetch()

    return agents.reduce((acc, agent) => {
      const state = Agents.getState(agent._id)
      return state === "new" ? acc + 1 : acc
    }, 0)
  }

  static observe(calibrationId, callback) {
    return CalibrationsBoth.find({ _id: calibrationId }).observe({
      changed: calibration => callback(calibration),
    })
  }
}
