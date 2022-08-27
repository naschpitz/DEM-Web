import { Meteor } from "meteor/meteor"

import Calibrations from "./class.js"

Meteor.methods({
  "calibrations.start"(calibrationId) {
    try {
      Calibrations.start(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "calibrations.pause"(calibrationId) {
    try {
      Calibrations.pause(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "calibrations.stop"(calibrationId) {
    try {
      Calibrations.stop(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "calibrations.reset"(calibrationId) {
    try {
      Calibrations.reset(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
