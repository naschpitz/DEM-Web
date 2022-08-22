import { Meteor } from "meteor/meteor"
import { HTTP } from "meteor/http"

import Calibrations from "../../calibrations/server/class"
import Materials from "../../materials/both/class.js"
import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import Sceneries from "../../sceneries/server/class.js"
import Servers from "../../servers/both/class.js"
import SimulationsBoth from "../both/class.js"
import SimulationsLogs from "../../simulationsLogs/both/class.js"
import SolidObjects from "../../solidObjects/both/class.js"

export default class Simulations extends SimulationsBoth {
  static start(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const serverId = simulation.server

    simulation.url = Meteor.absoluteUrl()

    const scenery = Sceneries.findOne({ owner: simulationId })
    const materials = Materials.find({ owner: scenery._id }).fetch()
    const nonSolidObjects = NonSolidObjects.find({ owner: scenery._id }).fetch()
    const solidObjects = SolidObjects.find({ owner: scenery._id }).fetch()

    simulation.scenery = scenery

    simulation.scenery.objects = {
      nonSolidObjects: nonSolidObjects,
      solidObjects: solidObjects,
    }

    simulation.scenery.materials = materials

    const postOptions = Servers.getPostOptions(serverId, "/simulations/start", simulation)

    this.post(simulationId, postOptions)
  }

  static pause(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const serverId = simulation.server

    const postOptions = Servers.getPostOptions(serverId, "/simulations/pause", simulation)

    this.post(simulationId, postOptions)
  }

  static stop(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const serverId = simulation.server

    const postOptions = Servers.getPostOptions(serverId, "/simulations/stop", simulation)

    this.post(simulationId, postOptions)
  }

  static reset(simulationId) {
    const simulation = Simulations.findOne(simulationId)

    const state = simulation.state

    if (state === "running" || state === "paused") throw { message: "Running or paused simulations cannot be reset" }

    Sceneries.resetByOwner(simulationId)
    SimulationsLogs.removeByOwner(simulationId)
    SimulationsBoth.setState(simulationId, "new")
  }

  static remove(simulationId) {
    const simulation = Simulations.findOne(simulationId)

    const state = simulation.state

    if (state !== "new" && state !== "stopped" && state !== "done")
      throw { message: "Only new, stopped or done simulations can be removed" }

    SimulationsBoth.remove(simulationId)

    Calibrations.removeByOwner(simulationId)
    Sceneries.removeByOwner(simulationId)
    SimulationsLogs.removeByOwner(simulationId)
  }

  static post(simulationId, postOptions) {
    try {
      HTTP.call("POST", postOptions.url, postOptions)
    } catch (error) {
      const simulationLog = {
        owner: simulationId,
      }

      const exception = {}

      if (error.response) {
        simulationLog.message = error.response.statusCode + " " + error.response.content
        exception.code = error.response.statusCode
        exception.message = error.response.content
      } else {
        simulationLog.message = error.message
        exception.code = error.code
        exception.message = error.message
      }

      SimulationsLogs.insert(simulationLog)
      throw exception
    }
  }
}
