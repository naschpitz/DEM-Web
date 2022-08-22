import { Meteor } from "meteor/meteor"

import Simulations from "./class.js"

Meteor.methods({
  "simulations.start"(simulationId) {
    try {
      Simulations.start(simulationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "simulations.pause"(simulationId) {
    try {
      Simulations.pause(simulationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "simulations.stop"(simulationId) {
    try {
      Simulations.stop(simulationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "simulations.reset"(simulationId) {
    try {
      this.unblock()
      Simulations.reset(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.remove"(simulationId) {
    try {
      Simulations.remove(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
