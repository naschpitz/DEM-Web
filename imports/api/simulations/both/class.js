import _ from "lodash"

import Calibrations from "../../calibrations/both/class.js"
import Sceneries from "../../sceneries/both/class.js"
import SimulationsDAO from "./dao.js"

export default class Simulations extends SimulationsDAO {
  static clone(simulationId, primary = true) {
    const oldSimulation = SimulationsDAO.findOne(simulationId)

    const newSimulation = _.cloneDeep(oldSimulation)
    delete newSimulation._id

    newSimulation.primary = primary
    newSimulation.name = oldSimulation.name + " (clone)"
    newSimulation.state = "new"

    const newSimulationId = SimulationsDAO.insert(newSimulation)

    Sceneries.clone(simulationId, newSimulationId)

    if (primary) {
      Calibrations.clone(simulationId, newSimulationId)
    }

    return newSimulationId
  }

  static create(owner) {
    const simulationId = SimulationsDAO.insert({ owner: owner })

    Calibrations.create(simulationId)
    Sceneries.create(simulationId)
  }

  static setState(simulationId, state) {
    const simulation = Simulations.findOne(simulationId)
    if (!simulation) {
      throw { message: "Simulations.setState(): simulation not found" }
      return
    }

    // If the simulation is being set as running, check if it is ordered to pause or stop. If so, do not set it as running.
    if ((simulation.state === "setToPause" || simulation.state === "setToStop") && state === "running") {
      return
    }

    const newSimulation = {
      _id: simulationId,
      state: state,
    }

    SimulationsDAO.updateObj(newSimulation)
  }

  static usesServer(serverId) {
    const simulationFound = Simulations.findOne({
      server: serverId,
      state: { $in: ["setToRun", "running", "setToPause", "paused", "setToStop"] },
    })

    return !!simulationFound
  }

  static removeServer(serverId) {
    Simulations.update(
      {
        server: serverId,
        state: { $nin: ["setToRun", "running", "setToPause", "paused", "setToStop"] },
      },
      {
        $unset: {
          server: "",
        },
      }
    )
  }
}
