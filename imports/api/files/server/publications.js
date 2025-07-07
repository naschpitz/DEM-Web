import { Meteor } from "meteor/meteor"

import Files from "../both/class"

if (Meteor.isServer) {
  Meteor.publish("files", function (owner) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Files.find({ owner: owner })
  })
}
