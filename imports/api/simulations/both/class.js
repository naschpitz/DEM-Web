import _ from "lodash"

import Calibrations from "../../calibrations/both/class"
import Sceneries from "../../sceneries/both/class.js"
import SimulationsDAO from "./dao.js"

export default class Simulations extends SimulationsDAO {
  static clone(simulationId) {
    const oldSimulation = SimulationsDAO.findOne(simulationId)

    const newSimulation = _.cloneDeep(oldSimulation)
    delete newSimulation._id
    newSimulation.name = oldSimulation.name + " (clone)"
    newSimulation.state = "new"

    const newSimulationId = SimulationsDAO.insert(newSimulation)

    Sceneries.clone(simulationId, newSimulationId)
  }

  static create(owner) {
    const simulationId = SimulationsDAO.insert({ owner: owner })

    Calibrations.create(simulationId)
    Sceneries.create(simulationId)
  }

  static setState(simulationId, state) {
    const simulation = {
      _id: simulationId,
      state: state,
    }

    SimulationsDAO.updateObj(simulation)
  }

  static usesServer(serverId) {
    const simulationFound = Simulations.findOne({ server: serverId, state: { $in: ["paused", "running"] } })

    return !!simulationFound
  }

  static removeServer(serverId) {
    Simulations.update(
      {
        server: serverId,
        state: { $nin: ["paused", "running"] },
      },
      {
        $unset: {
          server: "",
        },
      }
    )
  }
}
