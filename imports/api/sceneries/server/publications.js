import { Meteor } from "meteor/meteor"

import Calibrations from "../../calibrations/both/class.js"
import Sceneries from "../both/collection.js"

if (Meteor.isServer) {
  Meteor.publish("sceneries.compactList", function (simulationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Sceneries.find(
      {
        owner: simulationId,
      },
      {
        fields: { _id: 1, owner: 1, createdAt: 1 },
        sort: { createdAt: -1 },
      }
    )
  })

  Meteor.publish("sceneries.byOwner", function (simulationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Sceneries.find({ owner: simulationId })
  })
}
