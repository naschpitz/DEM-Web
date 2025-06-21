import { Meteor } from "meteor/meteor"

import Sceneries from "../server/class"

Meteor.methods({
  async "sceneries.removeByOwner"(simulationId) {
    try {
      await Sceneries.removeByOwner(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "sceneries.setStorage"(sceneryId, storage) {
    try {
      await Sceneries.setStorage(sceneryId, storage)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
