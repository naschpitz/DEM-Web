import AgentsHistoriesDAO from "./dao.js"

export default class AgentsHistories extends AgentsHistoriesDAO {
  static async removeByOwner(agentId) {
    await AgentsHistoriesDAO.removeAsync({ owner: agentId })
  }
}
