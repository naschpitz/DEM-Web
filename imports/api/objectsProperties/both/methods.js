import { Meteor } from "meteor/meteor"

import ObjectProperties from "./class.js"

Meteor.methods({
  "objectsProperties.create"(objectId) {
    try {
      ObjectProperties.create(objectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "objectsProperties.update"(objectProperty) {
    try {
      ObjectProperties.updateObj(objectProperty)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "objectsProperties.removeByOwner"(objectId) {
    try {
      ObjectProperties.removeByOwner(objectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
