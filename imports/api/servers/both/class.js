import ServersDAO from "./dao.js"
import Simulations from "../../simulations/both/class.js"

export default class Servers extends ServersDAO {
  static create() {
    return ServersDAO.insert({})
  }

  static remove(serverId) {
    const simulation = Simulations.usesServer(serverId)
    if (simulation) throw { message: "Cannot remove server, an active simulation makes reference to it." }

    ServersDAO.remove(serverId)
    Simulations.removeServer(serverId)
  }

  static getPostOptions(serverId, path, data) {
    const server = ServersDAO.findOne(serverId)

    return {
      url: "http://" + server.url + ":" + server.port + path,
      data: data,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  }
}
