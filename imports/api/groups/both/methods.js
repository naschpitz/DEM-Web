import { Meteor } from "meteor/meteor"

import Groups from "./class"

Meteor.methods({
  "groups.create"() {
    try {
      return Groups.create()
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "groups.update"(group) {
    try {
      return Groups.updateObj(group)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },
})