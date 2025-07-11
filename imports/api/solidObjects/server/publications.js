import { Meteor } from "meteor/meteor"

import SolidObjects from "../both/collection"

if (Meteor.isServer) {
  Meteor.publish("solidObjects.list", function (sceneryId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return SolidObjects.find({ owner: sceneryId })
  })

  Meteor.publish("solidObjects.solidObject", function (solidObjectId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return SolidObjects.find(solidObjectId)
  })
}
