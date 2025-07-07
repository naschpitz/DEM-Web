import { Meteor } from "meteor/meteor"

import Simulations from "./class"

Meteor.methods({
  async "simulations.clone"(simulationId) {
    try {
      await Simulations.clone(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.create"() {
    try {
      await Simulations.create()
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.update"(simulation) {
    try {
      await Simulations.updateObjAsync(simulation)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.setState"(simulationId, state) {
    try {
      await Simulations.setState(simulationId, state)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.usesServer"(serverId) {
    try {
      await Simulations.usesServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.removeServer"(serverId) {
    try {
      await Simulations.removeServer(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "simulations.unsetGroup"(simulationId, groupId) {
    try {
      await Simulations.unsetGroup(simulationId, groupId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
