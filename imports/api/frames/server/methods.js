import { Meteor } from "meteor/meteor"

import Frames from "./class.js"

Meteor.methods({
  async "frames.insert"(frame) {
    if (this.connection) throw new Meteor.Error("500", "This method can only be called from server")

    try {
      await Frames.insert(frame)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "frames.getFullFrame"(frameId) {
    if (this.connection) throw new Meteor.Error("500", "This method can only be called from server")

    try {
      return await Frames.getFullFrame(frameId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
