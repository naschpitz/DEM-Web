import LogsDAO from "./dao.js"
import moment from "moment"

export default class Logs extends LogsDAO {
  static removeByOwner(ownerId) {
    LogsDAO.remove({ owner: ownerId })
  }

  static clone(ownerId, newOwnerId) {
    const logs = LogsDAO.find({ owner: ownerId })

    const newLogs = logs.map(log => {
      delete log._id
      log.owner = newOwnerId

      return log
    })

    LogsDAO.insert(newLogs)
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

    const duration = moment.duration(log.progress.eta * 1000)

    return Logs.getDuration(duration)
  }

  static getPercentage(log) {
    if (!log) return { value: 0, text: "N/A" }

    const percentage = (log.progress.step / log.progress.totalSteps) * 100

    return { value: percentage, text: percentage.toFixed(3) + "%" }
  }
}
