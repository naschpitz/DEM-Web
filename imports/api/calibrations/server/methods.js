import { Meteor } from "meteor/meteor"

import Calibrations from "./class"

Meteor.methods({
  async "calibrations.start"(calibrationId) {
    try {
      await Calibrations.start(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "calibrations.pause"(calibrationId) {
    try {
      await Calibrations.pause(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "calibrations.stop"(calibrationId) {
    try {
      await Calibrations.stop(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "calibrations.reset"(calibrationId) {
    try {
      await Calibrations.reset(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
