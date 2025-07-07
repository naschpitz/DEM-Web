import GroupsDAO from "./dao"

export default class Groups extends GroupsDAO {
  static async create() {
    return await GroupsDAO.insertAsync({})
  }
}
