import { Meteor } from "meteor/meteor"

import Groups from "./class"

Meteor.methods({
  "groups.remove"(groupId, removeContents = false) {
    try {
      return Groups.removeAsync(groupId, removeContents)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },
})