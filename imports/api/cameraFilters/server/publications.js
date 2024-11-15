import { Meteor } from "meteor/meteor"

import CameraFiltersDAO from "../both/dao.js"

if (Meteor.isServer) {
  Meteor.publish("cameraFilters.list", function (sceneryId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return CameraFiltersDAO.find({ owner: sceneryId })
  })
}
