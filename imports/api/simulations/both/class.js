import _ from "lodash"

import Calibrations from "../../calibrations/both/class.js"
import Logs from "../../logs/both/class.js"
import Sceneries from "../../sceneries/both/class.js"
import SimulationsDAO from "./dao.js"

export default class Simulations extends SimulationsDAO {
  static clone(simulationId, primary = true, logs = false, frames = false) {
    const oldSimulation = SimulationsDAO.findOne(simulationId)

    const newSimulation = _.cloneDeep(oldSimulation)
    delete newSimulation._id

    newSimulation.primary = primary
    newSimulation.state = "new"

    if (primary) {
      newSimulation.name = oldSimulation.name + " (clone)"
    } else {
      delete newSimulation.name
      newSimulation.multiGPU = false
    }

    const newSimulationId = SimulationsDAO.insert(newSimulation)

    const maps = Sceneries.clone(simulationId, newSimulationId, frames)

    if (primary) {
      Calibrations.clone(
        simulationId,
        newSimulationId,
        maps.materialsMap,
        maps.nonSolidObjectsMap,
        maps.solidObjectsMap
      )
    }

    if (logs) {
      Logs.clone(simulationId, newSimulationId)
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

  static getState(simulation) {
    switch (simulation?.state) {
      case "new":
        return "New"
      case "setToRun":
        return "Set To Run"
      case "running":
        return "Running"
      case "setToPause":
        return "Set To Pause"
      case "paused":
        return "Paused"
      case "setToStop":
        return "Set To Stop"
      case "stopped":
        return "Stopped"
      case "done":
        return "Done"
      case "failed":
        return "Failed"
      default:
        return "N/A"
    }
  }
}
