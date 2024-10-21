import AgentsHistoriesDAO from './dao.js'

export default class AgentsHistories extends AgentsHistoriesDAO {
  static removeByOwner(agentId) {
    AgentsHistoriesDAO.remove({ owner: agentId })
  }
}