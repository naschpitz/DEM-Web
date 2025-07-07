import { Meteor } from "meteor/meteor"

import Frames from "./class"

Meteor.methods({
  async "frames.getData"(sceneryId, objectId, dataName, minInterval, maxInterval) {
    try {
      return await Frames.getData(sceneryId, objectId, dataName, minInterval, maxInterval)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
