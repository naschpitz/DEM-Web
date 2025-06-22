import { Meteor } from "meteor/meteor"

import Sceneries from "./class.js"

Meteor.methods({
  async "sceneries.create"(simulationId) {
    try {
      await Sceneries.create(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "sceneries.update"(scenery) {
    try {
      await Sceneries.updateObjAsync(scenery)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
