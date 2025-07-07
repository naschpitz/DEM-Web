import AgentsHistoriesDAO from "./dao"

export default class AgentsHistories extends AgentsHistoriesDAO {
  static async removeByOwner(agentId) {
    await AgentsHistoriesDAO.removeAsync({ owner: agentId })
  }
}
