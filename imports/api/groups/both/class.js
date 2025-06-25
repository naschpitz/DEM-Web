import GroupsDAO from "./dao.js"

export default class Groups extends GroupsDAO {
  static async create() {
    return await GroupsDAO.insertAsync({})
  }
}
