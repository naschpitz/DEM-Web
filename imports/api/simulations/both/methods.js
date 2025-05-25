import { Meteor } from "meteor/meteor"

import Simulations from "./class.js"

Meteor.methods({
  async "simulations.clone"(simulationId) {
    try {
      await Simulations.clone(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.create"() {
    try {
      Simulations.create()
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.update"(simulation) {
    try {
      Simulations.updateObj(simulation)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.setState"(simulationId, state) {
    try {
      Simulations.setState(simulationId, state)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.usesServer"(serverId) {
    try {
      Simulations.usesServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.removeServer"(serverId) {
    try {
      Simulations.removeServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulations.unsetGroup"(simulationId, groupId) {
    try {
      Simulations.unsetGroup(simulationId, groupId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  }
})
