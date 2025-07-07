import { Meteor } from "meteor/meteor"
import { Random } from "meteor/random"

import Calibrations from "../../calibrations/server/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Sceneries from "../../sceneries/server/class"
import Servers from "../../servers/both/class"
import SimulationsBoth from "../both/class"
import Logs from "../../logs/both/class"
import SolidObjects from "../../solidObjects/both/class"

export default class Simulations extends SimulationsBoth {
  static async start(simulationId) {
    // Create and set a unique token for the simulation instance
    const instance = Random.id()
    await SimulationsBoth.setInstance(simulationId, instance)

    const simulation = await Simulations.findOneAsync(simulationId)

    const serverId = simulation.server

    simulation.url = Meteor.absoluteUrl()

    const scenery = await Sceneries.findOneAsync({ owner: simulationId })
    const materials = await Materials.find({ owner: scenery._id }).fetchAsync()
    const nonSolidObjects = await NonSolidObjects.find({ owner: scenery._id }).fetchAsync()
    const solidObjects = await SolidObjects.find({ owner: scenery._id }).fetchAsync()

    simulation.scenery = scenery

    simulation.scenery.objects = {
      nonSolidObjects: nonSolidObjects,
      solidObjects: solidObjects,
    }

    simulation.scenery.materials = materials

    const postOptions = await Servers.getPostOptions(serverId, "/simulations/start", simulation)

    await SimulationsBoth.setState(simulationId, "setToRun")
    await this.post(simulationId, postOptions)
  }

  static async pause(simulationId) {
    const simulation = await Simulations.findOneAsync(simulationId)
    const state = simulation.state

    if (state !== "running") throw { message: "Only running simulations can be paused" }

    const serverId = simulation.server
    const postOptions = await Servers.getPostOptions(serverId, "/simulations/pause", simulation)

    await SimulationsBoth.setState(simulationId, "setToPause")
    await this.post(simulationId, postOptions)
  }

  static async stop(simulationId) {
    const simulation = await Simulations.findOneAsync(simulationId)
    const state = simulation.state

    if (state !== "paused" && state !== "running")
      throw { message: "Only paused or running simulations can be stopped" }

    const serverId = simulation.server
    const postOptions = await Servers.getPostOptions(serverId, "/simulations/stop", simulation)

    await SimulationsBoth.setState(simulationId, "setToStop")
    await this.post(simulationId, postOptions)
  }

  static async reset(simulationId) {
    const simulation = await Simulations.findOneAsync(simulationId)
    const state = simulation.state

    if (["setToRun", "running", "setToPause", "paused", "setToStop"].includes(state)) {
      throw { message: "Running or paused simulations cannot be reset" }
    }

    // The first thing to do is to remove the simulation instance, so we can prevent new frames from being processed
    // and set to the simulation as it is being reset.
    const promises = []
    promises.push(SimulationsBoth.setInstance(simulationId, null))
    promises.push(Sceneries.resetByOwner(simulationId))
    promises.push(Logs.removeByOwner(simulationId))
    promises.push(SimulationsBoth.setState(simulationId, "new"))

    await Promise.all(promises)
  }

  static async removeAsync(simulationId) {
    const simulation = await Simulations.findOneAsync(simulationId)

    if (!simulation) return

    const state = simulation.state

    if (!["new", "stopped", "done", "failed"].includes(state))
      throw { message: "Only new, stopped, done or failed simulations can be removed" }

    const promises = []
    promises.push(Sceneries.removeByOwner(simulationId))
    promises.push(Logs.removeByOwner(simulationId))

    if (simulation.primary) promises.push(Calibrations.removeByOwner(simulationId))

    promises.push(SimulationsBoth.removeAsync(simulationId))

    await Promise.all(promises)
  }

  static async removeByGroup(groupId) {
    const simulations = await Simulations.find({ group: groupId }).fetchAsync()

    const promises = simulations.map(simulation => this.removeAsync(simulation._id))

    await Promise.allSettled(promises)
  }

  static async post(simulationId, postOptions) {
    try {
      const response = await fetch(postOptions.url, {
        method: "POST",
        headers: postOptions.headers,
        body: JSON.stringify(postOptions.data),
      })

      if (!response.ok) {
        const error = new Error(`HTTP ${response.status}`)
        error.code = response.status
        throw error
      }

      // Handle HTTP 204 No Content responses (legitimate empty responses)
      if (response.status === 204) {
        return null
      }

      // Check the content-type of the response
      if (response.headers.get("content-type")?.includes("application/json")) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      const simulationLog = {
        owner: simulationId,
        message: error.message,
      }

      if (!error.code) error.code = 500

      await Logs.insertAsync(simulationLog)
      await SimulationsBoth.setState(simulationId, "failed")

      throw error
    }
  }
}
