import { Meteor } from "meteor/meteor"

import CameraFilters from "./class.js"

Meteor.methods({
  async "cameraFilters.create"(sceneryId) {
    try {
      await CameraFilters.create(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "cameraFilters.update"(cameraFilter) {
    try {
      await CameraFilters.updateObjAsync(cameraFilter)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "cameraFilters.remove"(cameraFilterId) {
    try {
      await CameraFilters.removeAsync(cameraFilterId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})