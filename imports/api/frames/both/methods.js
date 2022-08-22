import { Meteor } from "meteor/meteor"

import Frames from "./class.js"

Meteor.methods({
  "frames.getData"(sceneryId, objectId, dataName, minInterval, maxInterval) {
    try {
      return Frames.getData(sceneryId, objectId, dataName, minInterval, maxInterval)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
