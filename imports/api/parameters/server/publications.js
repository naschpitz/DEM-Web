import { Meteor } from "meteor/meteor"

import Parameters from "../both/class"

if (Meteor.isServer) {
  Meteor.publish("parameters.list", function (calibrationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Parameters.find({ owner: calibrationId })
  })
}
