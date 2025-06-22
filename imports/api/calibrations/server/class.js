import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class"
import Hypervisor from "./hypervisor"
import Logs from "../../logs/both/class"
import CalibrationsDAO from "../both/dao";
import DataSets from "../../dataSets/both/class";
import Parameters from "../../parameters/both/class";

export default class Calibrations extends CalibrationsBoth {
  static async start(calibrationId) {
    const hypervisor = new Hypervisor(calibrationId)

    try {
      await hypervisor.initialize()
    } catch (error) {
      console.log(error)
    }

    await CalibrationsBoth.updateObjAsync({ _id: calibrationId, state: "running" })
  }

  static async pause(calibrationId) {
    const calibration = await CalibrationsBoth.findOneAsync(calibrationId)
    const state = calibration.state

    if (state !== "running") throw { message: "Only running calibrations can be paused" }

    await CalibrationsBoth.updateObjAsync({ _id: calibrationId, state: "paused" })

    const agentsPromises = await Agents.find({ owner: calibrationId }).mapAsync(async (agent) => {
      const state = Agents.getState(agent._id)

      if (state === "running") await Agents.pause(agent._id)
    })

    await Promise.all(agentsPromises)
  }

  static async stop(calibrationId) {
    const calibration = await CalibrationsBoth.findOneAsync(calibrationId)
    const state = calibration.state

    if (state !== "paused" && state !== "running")
      throw { message: "Only paused or running calibrations can be stopped" }

    await CalibrationsBoth.updateObjAsync({ _id: calibrationId, state: "stopped" })

    const agentsPromises = await Agents.find({ owner: calibrationId }).mapAsync(async (agent) => {
      const state = Agents.getState(agent._id)

      if (state === "running" || state === "paused") await Agents.stop(agent._id)
    })

    await Promise.all(agentsPromises)
  }

  static async reset(calibrationId) {
    const calibration = await CalibrationsBoth.findOneAsync(calibrationId)
    const state = calibration.state

    if (state === "running" || state === "paused") throw { message: "Running or paused calibration cannot be reset" }

    const promises = []
    promises.push(Logs.removeByOwner(calibrationId))
    promises.push(Agents.removeByOwner(calibrationId))

    await Promise.all(promises)

    await CalibrationsBoth.updateObjAsync({ _id: calibrationId, state: "new", currentIteration: 0 })
  }

  static async removeByOwner(simulationId) {
    const calibration = await CalibrationsDAO.findOneAsync({ owner: simulationId })

    const promises = []
    promises.push(DataSets.removeByOwner(calibration._id))
    promises.push(Logs.removeByOwner(calibration._id))
    promises.push(Parameters.removeByOwner(calibration._id))
    promises.push(Agents.removeByOwner(calibration._id))

    await Promise.all(promises)

    await CalibrationsDAO.removeAsync(calibration._id)
  }

  static async removeServer(serverId) {
    await CalibrationsDAO.update(
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
    await Calibrations.log(calibrationId, "Updating agents' scores.")
    await Agents.updateAllScores(calibrationId)

    await Calibrations.log(calibrationId, "Saving agents' histories.")
    await Agents.saveAllAgentsHistories(calibrationId)

    const calibration = CalibrationsBoth.findOneAsync(calibrationId)

    // After saving the history, we can check the stop condition
    await Calibrations.log(calibrationId, "Checking stop condition.")
    const stopConditionMet = await Calibrations.checkStopCondition(calibrationId)
    const bestScores = await Agents.getBestScores(calibrationId)

    stopConditionMet ?
      await Calibrations.log(calibrationId, "Stop condition met.") :
      await Calibrations.log(calibrationId, "Stop condition not met.")

    await Calibrations.log(calibrationId, `Best scores: ${bestScores.map(score => score.toFixed(8)).join(", ")}`)

    if ((calibration.currentIteration < calibration.maxIterations - 1) && !stopConditionMet) {
      await Calibrations.log(calibrationId, "Advancing all agents to the next iteration.")
      await Agents.nextAllIterations(calibrationId)

      await Calibrations.log(calibrationId, "Advancing calibration to the next iteration.")
      await CalibrationsBoth.updateObjAsync({ _id: calibration._id, currentIteration: calibration.currentIteration + 1 })
    } else {
      await Calibrations.log(calibrationId, "Calibration done.")
      await Calibrations.setState(calibrationId, "done")
    }
  }

  static async getNumRunningAgents(calibrationId) {
    const agents = await Agents.find({ owner: calibrationId }).fetchAsync()

    let numRunningAgents = 0
    for (const agent of agents) {
      const state = await Agents.getState(agent._id)
      if (state === "setToRun" || state === "running") numRunningAgents++
    }

    return numRunningAgents
  }

  static async getNumNewAgents(calibrationId) {
    const agents = await Agents.find({ owner: calibrationId }).fetchAsync()

    let numNewAgents = 0
    for (const agent of agents) {
      const state = await Agents.getState(agent._id)
      if (state === "new") numNewAgents++
    }

    return numNewAgents
  }

  static async observeAsync(calibrationId, callback) {
    return await CalibrationsBoth.find({ _id: calibrationId }).observeAsync({
      changed: calibration => callback(calibration),
    })
  }

  static async log(calibrationId, message) {
    await Logs.insertAsync({ owner: calibrationId, message: message })
  }
}
