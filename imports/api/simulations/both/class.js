import _ from "lodash"

import Calibrations from "../../calibrations/both/class.js"
import Logs from "../../logs/both/class.js"
import Sceneries from "../../sceneries/both/class.js"
import SimulationsDAO from "./dao.js"

export default class Simulations extends SimulationsDAO {
  static async clone(simulationId, primary = true, logs = false, frames = false) {
    const oldSimulation = await SimulationsDAO.findOneAsync(simulationId)

    const newSimulation = _.cloneDeep(oldSimulation)
    delete newSimulation._id

    newSimulation.primary = primary
    newSimulation.state = "new"

    if (primary) {
      newSimulation.name = oldSimulation.name + " (clone)"
    } else {
      delete newSimulation.name
      delete newSimulation.notes
      newSimulation.multiGPU = false
    }

    const newSimulationId = await SimulationsDAO.insertAsync(newSimulation)

    const maps = await Sceneries.clone(simulationId, newSimulationId, frames)

    if (primary) {
      await Calibrations.clone(
        simulationId,
        newSimulationId,
        maps.materialsMap,
        maps.nonSolidObjectsMap,
        maps.solidObjectsMap
      )
    }

    if (logs) {
      await Logs.clone(simulationId, newSimulationId)
    }

    return newSimulationId
  }

  static async create(owner) {
    const simulationId = await SimulationsDAO.insertAsync({ owner: owner })

    await Calibrations.create(simulationId)
    await Sceneries.create(simulationId)
  }

  static async setState(simulationId, state) {
    const simulation = await Simulations.findOneAsync(simulationId)
    if (!simulation) {
      throw { message: "Simulations.setState(): simulation not found" }
    }

    // If the simulation is being set as running, check if it is ordered to pause or stop. If so, do not set it as running.
    if ((simulation.state === "setToPause" || simulation.state === "setToStop") && state === "running") {
      return
    }

    const newSimulation = {
      _id: simulationId,
      state: state,
    }

    await SimulationsDAO.updateObjAsync(newSimulation)
  }

  static async usesServer(serverId) {
    const simulationFound = await Simulations.findOneAsync({
      server: serverId,
      state: { $in: ["setToRun", "running", "setToPause", "paused", "setToStop"] },
    })

    return !!simulationFound
  }

  static async removeServer(serverId) {
    await Simulations.updateSync(
      {
        server: serverId,
        state: { $nin: ["setToRun", "running", "setToPause", "paused", "setToStop"] },
      },
      {
        $unset: {
          server: "",
        },
      },
      { multi: true }
    )
  }

  // If a simulationId is provided, it will remove only the simulations from the group it belongs to.
  // Otherwise, if a groupId is provided, it will remove all simulations from that group.
  static async unsetGroup(simulationId, groupId) {
    const selector = simulationId ? { _id: simulationId } : { group: groupId }

    await Simulations.updateSync(
      selector,
      {
        $unset: {
          group: "",
        },
      },
      { multi: true }
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

  static async setInstance(simulationId, instance) {
    await SimulationsDAO.updateObjAsync({
      _id: simulationId,
      instance: instance
    });
  }
}
