import { Meteor } from "meteor/meteor"

import CamerasDAO from "../both/dao"

if (Meteor.isServer) {
  Meteor.publish("cameras.camera", function (sceneryId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return CamerasDAO.find({ owner: sceneryId })
  })
}
