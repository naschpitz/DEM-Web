import { Meteor } from "meteor/meteor"
import { HTTP } from "meteor/http"
import { Random } from "meteor/random"

import Calibrations from "../../calibrations/server/class.js"
import Materials from "../../materials/both/class.js"
import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import Sceneries from "../../sceneries/server/class.js"
import Servers from "../../servers/both/class.js"
import SimulationsBoth from "../both/class.js"
import Logs from "../../logs/both/class.js"
import SolidObjects from "../../solidObjects/both/class.js"

export default class Simulations extends SimulationsBoth {
  static start(simulationId) {
    // Create and set a unique token for the simulation instance
    const instance = Random.id()
    SimulationsBoth.setInstance(simulationId, instance)

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

    SimulationsBoth.setState(simulationId, "setToRun")
    this.post(simulationId, postOptions)
  }

  static pause(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const state = simulation.state

    if (state !== "running") throw { message: "Only running simulations can be paused" }

    const serverId = simulation.server
    const postOptions = Servers.getPostOptions(serverId, "/simulations/pause", simulation)

    SimulationsBoth.setState(simulationId, "setToPause")
    this.post(simulationId, postOptions)
  }

  static stop(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const state = simulation.state

    if (state !== "paused" && state !== "running")
      throw { message: "Only paused or running simulations can be stopped" }

    const serverId = simulation.server
    const postOptions = Servers.getPostOptions(serverId, "/simulations/stop", simulation)

    SimulationsBoth.setState(simulationId, "setToStop")
    this.post(simulationId, postOptions)
  }

  static reset(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const state = simulation.state

    if (["setToRun", "running", "setToPause", "paused", "setToStop"].includes(state)) {
      throw { message: "Running or paused simulations cannot be reset" }
    }

    // The first thing to do is to remove the simulation instance, so we can prevent new frames from being processed
    // and set to the simulation as it is being reset.
    SimulationsBoth.setInstance(simulationId, null)
    Sceneries.resetByOwner(simulationId)
    Logs.removeByOwner(simulationId)
    SimulationsBoth.setState(simulationId, "new")
  }

  static remove(simulationId) {
    const simulation = Simulations.findOne(simulationId)
    const state = simulation.state

    if (!["new", "stopped", "done", "failed"].includes(state))
      throw { message: "Only new, stopped, done or failed simulations can be removed" }

    SimulationsBoth.remove(simulationId)

    Sceneries.removeByOwner(simulationId)
    Logs.removeByOwner(simulationId)

    if (simulation.primary) Calibrations.removeByOwner(simulationId)
  }

  static removeByGroup(groupId) {
    const simulations = Simulations.find({ group: groupId })

    simulations.forEach(simulation => this.remove(simulation._id))
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

      Logs.insert(simulationLog)
      throw exception
    }
  }
}
