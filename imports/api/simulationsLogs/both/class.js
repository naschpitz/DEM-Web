import SimulationsLogsDAO from "./dao.js"

export default class SimulationsLogs extends SimulationsLogsDAO {
  static removeByOwner(simulationId) {
    SimulationsLogsDAO.remove({ owner: simulationId })
  }
}
