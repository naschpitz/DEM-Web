import { Meteor } from "meteor/meteor"

import Cameras from "./class"

Meteor.methods({
  async "cameras.create"(sceneryId) {
    try {
      await Cameras.create(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "cameras.update"(camera) {
    try {
      await Cameras.updateObjAsync(camera)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
