import { Meteor } from "meteor/meteor"

import FramesImages from "./class.js"

Meteor.methods({
  async "framesImages.render"(frameId, dimensions) {
    try {
      this.unblock()
      return await FramesImages.render(frameId, dimensions, false)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
