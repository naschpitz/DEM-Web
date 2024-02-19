import { Meteor } from "meteor/meteor"

import Groups from "./class"

Meteor.methods({
  "groups.remove"(groupId, removeContents) {
    try {
      return Groups.remove(groupId, removeContents)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },
})