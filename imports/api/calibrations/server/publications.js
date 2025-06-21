import { Meteor } from "meteor/meteor"

import Calibrations from "../../calibrations/server/class"
import Simulations from "../../simulations/both/class"

if (Meteor.isServer) {
  Meteor.publish("calibrations.byOwner", function (simulationId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    const simulation = Simulations.findOneAsync({ _id: simulationId })
    if (!simulation) return this.error(new Meteor.Error("404", "Not found", "No Simulation found."))

    if (simulation.owner !== this.userId)
      return this.error(
        new Meteor.Error("401", "Unauthorized", "The current user is not the owner of this Calibration.")
      )

    return Calibrations.find({ owner: simulationId })
  })

  Meteor.publish("calibrations.calibration", function (calibrationId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    const calibrations = Calibrations.find({ _id: calibrationId }).map(calibration => calibration)
    if (calibrations.length === 0) return this.error(new Meteor.Error("404", "Not found", "No Calibration found."))

    const calibrationFound = calibrations[0]

    const simulations = Simulations.find({ _id: calibrationFound.owner })
    if (simulations.length === 0) return this.error(new Meteor.Error("404", "Not found", "No Simulation found."))

    const simulationFound = simulations[0]

    if (simulationFound.owner !== this.userId)
      return this.error(
        new Meteor.Error("401", "Unauthorized", "The current user is not the owner of this Calibration.")
      )

    return Calibrations.find({ _id: calibrationId })
  })
}
