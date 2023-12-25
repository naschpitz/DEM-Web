import { Meteor } from "meteor/meteor"

import FramesImages from "./class.js"

Meteor.methods({
  "framesImages.render"(frameId, dimensions) {
    try {
      this.unblock()
      return FramesImages.render(frameId, dimensions, false)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  // Currently not used
  "framesImages.renderAll"(sceneryId, dimensions) {
    try {
      this.unblock()
      return FramesImages.renderAll(sceneryId, dimensions)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
