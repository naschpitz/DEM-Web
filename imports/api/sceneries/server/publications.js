import { Meteor } from "meteor/meteor"

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

  Meteor.publish("sceneries.scenery", function (simulationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Sceneries.find({ owner: simulationId })
  })
}
