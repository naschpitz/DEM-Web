import { Meteor } from "meteor/meteor"

import Calibrations from "../../calibrations/server/class"
import Simulations from "../../simulations/both/class"

if (Meteor.isServer) {
  Meteor.publish("calibrations.byOwner", async function (simulationId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    const simulation = await Simulations.findOneAsync({ _id: simulationId })
    if (!simulation) return this.error(new Meteor.Error("404", "Not found", "No Simulation found."))

    console.log("simulation", simulation)
    console.log(this.userId)

    if (simulation.owner !== this.userId)
      return this.error(
        new Meteor.Error("401", "Unauthorized", "The current user is not the owner of this Calibration.")
      )

    return Calibrations.find({ owner: simulationId })
  })

  Meteor.publish("calibrations.calibration", async function (calibrationId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    const calibrations = await Calibrations.find({ _id: calibrationId }).fetchAsync()
    if (calibrations.length === 0) return this.error(new Meteor.Error("404", "Not found", "No Calibration found."))

    console.log("calibration", calibrations)

    const calibrationFound = calibrations[0]

    const simulations = await Simulations.find({ _id: calibrationFound.owner }).fetchAsync()
    if (simulations.length === 0) return this.error(new Meteor.Error("404", "Not found", "No Simulation found."))

    const simulationFound = simulations[0]

    if (simulationFound.owner !== this.userId)
      return this.error(
        new Meteor.Error("401", "Unauthorized", "The current user is not the owner of this Calibration.")
      )

    return Calibrations.find({ _id: calibrationId })
  })
}
