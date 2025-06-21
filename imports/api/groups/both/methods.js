import { Meteor } from "meteor/meteor"

import Groups from "./class"

Meteor.methods({
  async "groups.create"() {
    try {
      return await Groups.create()
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "groups.update"(group) {
    try {
      return await Groups.updateObjAsync(group)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },
})