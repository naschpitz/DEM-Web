import { Meteor } from "meteor/meteor"

import ObjectProperties from "./class"

Meteor.methods({
  async "objectsProperties.create"(objectId) {
    try {
      await ObjectProperties.create(objectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "objectsProperties.update"(objectProperty) {
    try {
      await ObjectProperties.updateObjAsync(objectProperty)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "objectsProperties.removeByOwner"(objectId) {
    try {
      await ObjectProperties.removeByOwner(objectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
