import ServersDAO from "./dao"
import Simulations from "../../simulations/both/class"

export default class Servers extends ServersDAO {
  static async create() {
    return await ServersDAO.insertAsync({})
  }

  static async removeAsync(serverId) {
    const simulation = await Simulations.usesServer(serverId)
    if (simulation) throw { message: "Cannot remove server, an active simulation makes reference to it." }

    await ServersDAO.removeAsync(serverId)
    await Simulations.removeServer(serverId)
  }

  static async getPostOptions(serverId, path, data) {
    const server = await ServersDAO.findOneAsync(serverId)

    return {
      url: "https://" + server.url + ":" + server.port + path,
      data: data,
      headers: {
        "Content-Type": "application/json; charset=UTF-8",
      },
    }
  }
}
