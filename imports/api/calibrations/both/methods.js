import { Meteor } from "meteor/meteor"

import Calibrations from "./class.js"

Meteor.methods({
  "calibrations.create"() {
    try {
      Calibrations.create()
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "calibrations.update"(simulation) {
    try {
      Calibrations.updateObj(simulation)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "calibrations.setState"(simulationId, state) {
    try {
      Calibrations.setState(simulationId, state)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "calibrations.usesServer"(serverId) {
    try {
      Calibrations.usesServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "calibrations.removeServer"(serverId) {
    try {
      Calibrations.removeServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
