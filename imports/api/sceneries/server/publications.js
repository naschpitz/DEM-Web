import { Meteor } from "meteor/meteor"

import Sceneries from "../both/collection"

if (Meteor.isServer) {
  Meteor.publish("sceneries.list", function (simulationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Sceneries.find({ owner: simulationId })
  })

  Meteor.publish("sceneries.byOwner", function (simulationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Sceneries.find({ owner: simulationId })
  })
}
