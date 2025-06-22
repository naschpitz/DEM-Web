import { Meteor } from "meteor/meteor"

import Logs from "./class.js"

Meteor.methods({
  async "logs.insert"(log) {
    try {
      return await Logs.insertAsync(log)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "logs.removeByOwner"(ownerId) {
    try {
      await Logs.removeByOwner(ownerId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
