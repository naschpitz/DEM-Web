import GroupsDAO from "./dao.js"

export default class Groups extends GroupsDAO {
  static create() {
    return GroupsDAO.insert({})
  }
}