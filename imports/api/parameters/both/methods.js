import { Meteor } from "meteor/meteor"

import Parameters from "./class.js"

Meteor.methods({
  "parameters.create"(calibrationId) {
    try {
      Parameters.create(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "parameters.update"(parameter) {
    try {
      Parameters.updateObj(parameter)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "parameters.remove"(parameterId) {
    try {
      Parameters.remove(parameterId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "parameters.removeByOwner"(calibrationId) {
    try {
      Parameters.removeByOwner(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
