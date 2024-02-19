import GroupsDAO from "./dao.js"
import Simulations from "../../simulations/both/class"

export default class Groups extends GroupsDAO {
  static create() {
    return GroupsDAO.insert()
  }

  static update() {
    return GroupsDAO.update()
  }
}