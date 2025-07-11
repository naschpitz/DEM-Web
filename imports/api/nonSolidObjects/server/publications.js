import { Meteor } from "meteor/meteor"

import NonSolidObjects from "../both/collection"

if (Meteor.isServer) {
  Meteor.publish("nonSolidObjects.list", function (sceneryId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return NonSolidObjects.find({ owner: sceneryId })
  })

  Meteor.publish("nonSolidObjects.nonSolidObject", function (nonSolidObjectId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return NonSolidObjects.find(nonSolidObjectId)
  })
}
