import { Meteor } from "meteor/meteor"

import DataSets from "../both/class"

if (Meteor.isServer) {
  Meteor.publish("dataSets.list", function (calibrationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return DataSets.find({ owner: calibrationId })
  })
}
