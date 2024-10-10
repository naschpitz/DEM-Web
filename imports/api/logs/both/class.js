import moment from "moment"

import LogsDAO from "./dao.js"
import Simulations from "../../simulations/both/class";

export default class Logs extends LogsDAO {
  static removeByOwner(ownerId) {
    LogsDAO.remove({ owner: ownerId })
  }

  static clone(ownerId, newOwnerId) {
    const logs = LogsDAO.find({ owner: ownerId })

    logs.forEach(log => {
      delete log._id
      log.owner = newOwnerId

      LogsDAO.insert(log, { getAutoValues: false })
    })
  }

  static getDuration(duration) {
    let ret = ""
    ret += duration.years() + "y "
    ret += duration.months() + "m "
    ret += duration.days() + "d "
    ret += " " + duration.hours().toString().padStart(2, "0")
    ret += ":" + duration.minutes().toString().padStart(2, "0")
    ret += ":" + duration.seconds().toString().padStart(2, "0")

    return ret
  }

  static getEt(log) {
    if (!log) return "N/A"

    const duration = moment.duration(log.progress.et * 1000)

    return Logs.getDuration(duration)
  }

  static getEta(log) {
    if (!log || log.state !== "running") return "N/A"
    if (log?.progress?.eta === undefined) return "N/A"

    const duration = moment.duration(log.progress.eta * 1000)

    return Logs.getDuration(duration)
  }

  static getPercentage(log) {
    if (!log) return { value: 0, text: "N/A" }

    const percentage = (log.progress.step / log.progress.totalSteps) * 100

    return { value: percentage, text: percentage.toFixed(3) + "%" }
  }

  static getState(log) {
    switch (log?.state) {
      case "new":
        return "New"
      case "running":
        return "Running"
      case "paused":
        return "Paused"
      case "stopped":
        return "Stopped"
      case "done":
        return "Done"
      default:
        return "N/A"
    }
  }

  // 'skipCheck' is used to avoid checking if the instance is the same as the simulation's instance.
  // This is useful when inserting logs for calibrations or logs that don't have an instance on it, like the ones
  // originated from the server. The ones that come from Math Core and hit the rest service, they have an instance
  // on it.
  static insert(log, skipCheck = true) {
    if (!skipCheck) {
      const simulation = Simulations.findOne(log.owner)

      // The log.owner could be referring to a Calibration, which does not have an instance, so we need to check if
      // the simulation exists before checking the instance.
      if (simulation && simulation.instance !== log.instance)
        return
    }

    LogsDAO.insert(log)
  }
}
