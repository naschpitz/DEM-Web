import { Meteor } from "meteor/meteor"

import Frames from "./class"

Meteor.methods({
  async "frames.insert"(frame) {
    if (this.connection) throw new Meteor.Error("500", "This method can only be called from server")

    try {
      await Frames.insertAsync(frame)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "frames.getDetailedFrame"(frameId) {
    if (this.connection) throw new Meteor.Error("500", "This method can only be called from server")

    try {
      return await Frames.getDetailedFrame(frameId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
