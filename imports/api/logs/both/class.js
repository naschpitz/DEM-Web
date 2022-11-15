import LogsDAO from "./dao.js"

export default class Logs extends LogsDAO {
  static removeByOwner(ownerId) {
    LogsDAO.remove({ owner: ownerId })
  }
}
