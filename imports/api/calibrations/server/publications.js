import { Meteor } from "meteor/meteor"

import Calibrations from "../../calibrations/server/class"
import Simulations from "../../simulations/both/class"

if (Meteor.isServer) {
  Meteor.publish("calibrations.byOwner", function (simulationId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    const simulation = Simulations.findOne({ _id: simulationId })

    if (!simulation) return this.error(new Meteor.Error("404", "Not found", "No Simulation found."))

    if (simulation.owner !== this.userId)
      return this.error(
        new Meteor.Error("401", "Unauthorized", "The current user is not the owner of this Calibration.")
      )

    return Calibrations.find({ owner: simulationId })
  })
}
