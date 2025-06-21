import { Meteor } from "meteor/meteor"

import CameraFilters from "./class.js"

Meteor.methods({
  "cameraFilters.create"(sceneryId) {
    try {
      CameraFilters.create(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "cameraFilters.update"(cameraFilter) {
    try {
      CameraFilters.updateObjAsync(cameraFilter)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "cameraFilters.remove"(cameraFilterId) {
    try {
      CameraFilters.removeAsync(cameraFilterId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})