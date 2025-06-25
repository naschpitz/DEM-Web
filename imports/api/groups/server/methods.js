import { Meteor } from "meteor/meteor"

import Groups from "./class"

Meteor.methods({
  async "groups.remove"(groupId, removeContents = false) {
    try {
      return await Groups.removeAsync(groupId, removeContents)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },
})
