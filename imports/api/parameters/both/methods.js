import { Meteor } from "meteor/meteor"

import Parameters from "./class"

Meteor.methods({
  async "parameters.create"(calibrationId) {
    try {
      await Parameters.create(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "parameters.update"(parameter) {
    try {
      await Parameters.updateObjAsync(parameter)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "parameters.remove"(parameterId) {
    try {
      await Parameters.removeAsync(parameterId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "parameters.removeByOwner"(calibrationId) {
    try {
      await Parameters.removeByOwner(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
