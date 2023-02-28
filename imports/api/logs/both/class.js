import LogsDAO from "./dao.js"

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
}
