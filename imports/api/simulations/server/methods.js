import { Meteor } from "meteor/meteor"

import Simulations from "./class.js"

Meteor.methods({
  async "simulations.start"(simulationId) {
    try {
      await Simulations.start(simulationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "simulations.pause"(simulationId) {
    try {
      await Simulations.pause(simulationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "simulations.stop"(simulationId) {
    try {
      await Simulations.stop(simulationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "simulations.reset"(simulationId) {
    try {
      this.unblock()
      await Simulations.reset(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.remove"(simulationId) {
    try {
      await Simulations.removeAsync(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
