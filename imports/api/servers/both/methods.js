import { Meteor } from "meteor/meteor"

import Servers from "./class"

Meteor.methods({
  async "servers.create"() {
    try {
      await Servers.create()
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "servers.update"(server) {
    try {
      await Servers.updateObjAsync(server)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "servers.remove"(serverId) {
    try {
      await Servers.removeAsync(serverId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "servers.getPostOptions"(serverId, path, data) {
    try {
      return await Servers.getPostOptions(serverId, path, data)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
