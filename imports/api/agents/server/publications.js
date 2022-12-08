import { Meteor } from "meteor/meteor"

import Agents from "../both/class"

if (Meteor.isServer) {
  Meteor.publish("agents.list", function (calibrationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Agents.find({ owner: calibrationId })
  })
}
