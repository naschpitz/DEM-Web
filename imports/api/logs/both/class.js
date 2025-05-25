import moment from "moment"

import LogsDAO from "./dao.js"
import Simulations from "../../simulations/both/class";

export default class Logs extends LogsDAO {
  static removeByOwner(ownerId) {
    LogsDAO.remove({ owner: ownerId })
  }

  static async clone(oldSimulationId, newSimulationId) {
    const rawCollection = LogsDAO.rawCollection();

    const cursor = rawCollection.find({ owner: oldSimulationId });
    const batchSize = 1000;
    let batch = [];

    while (await cursor.hasNext()) {
      const log = await cursor.next();
      const { _id, ...rest } = log;
      batch.push({ ...rest, owner: newSimulationId });

      if (batch.length === batchSize) {
        await rawCollection.insertMany(batch, { ordered: false });
        batch = []; // reset batch
      }
    }

    // Insert any remaining logs
    if (batch.length > 0) {
      await rawCollection.insertMany(batch, { ordered: false });
    }
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
}
