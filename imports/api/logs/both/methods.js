import { Meteor } from "meteor/meteor"

import Logs from "./class.js"

Meteor.methods({
  "logs.insert"(log) {
    try {
      return Logs.insertAsync(log)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "logs.removeByOwner"(ownerId) {
    try {
      Logs.removeByOwner(ownerId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
