import { Meteor } from "meteor/meteor"

import Sceneries from "./class.js"

Meteor.methods({
  "sceneries.create"(simulationId) {
    try {
      Sceneries.create(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "sceneries.update"(scenery) {
    try {
      Sceneries.updateObjAsync(scenery)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
