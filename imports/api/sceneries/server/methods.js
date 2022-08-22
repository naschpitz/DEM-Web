import { Meteor } from "meteor/meteor"

import Sceneries from "../server/class"

Meteor.methods({
  "sceneries.removeByOwner"(simulationId) {
    try {
      Sceneries.removeByOwner(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "sceneries.setStorage"(sceneryId, storage) {
    try {
      Sceneries.setStorage(sceneryId, storage)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
