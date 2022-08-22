import { Meteor } from "meteor/meteor"

import Frames from "./class.js"

Meteor.methods({
  "frames.insert"(frame) {
    if (this.connection) throw new Meteor.Error("500", "This method can only be called from server")

    try {
      Frames.insert(frame)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "frames.getFullFrame"(frameId) {
    if (this.connection) throw new Meteor.Error("500", "This method can only be called from server")

    try {
      return Frames.getFullFrame(frameId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
