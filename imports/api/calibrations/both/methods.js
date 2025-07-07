import { Meteor } from "meteor/meteor"

import Calibrations from "./class"

Meteor.methods({
  async "calibrations.create"() {
    try {
      await Calibrations.create()
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "calibrations.update"(calibration) {
    try {
      await Calibrations.updateObjAsync(calibration)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "calibrations.setState"(simulationId, state) {
    try {
      await Calibrations.setState(simulationId, state)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "calibrations.usesServer"(serverId) {
    try {
      await Calibrations.usesServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "calibrations.removeServer"(serverId) {
    try {
      await Calibrations.removeServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
