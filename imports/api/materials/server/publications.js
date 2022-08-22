import { Meteor } from "meteor/meteor"

import Materials from "../both/class.js"

if (Meteor.isServer) {
  Meteor.publish("materials.list", function (sceneryId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Materials.find({ owner: sceneryId })
  })
}
