import LogsCol from "./collection.js"

export default class LogsDAO {
  static find(...args) {
    return LogsCol.find(...args)
  }

  static findOne(...args) {
    return LogsCol.findOne(...args)
  }

  static insert(...args) {
    return LogsCol.insert(...args)
  }

  static update(...args) {
    return LogsCol.update(...args)
  }

  static upsert(...args) {
    return LogsCol.upsert(...args)
  }

  static remove(...args) {
    return LogsCol.remove(...args)
  }
}
