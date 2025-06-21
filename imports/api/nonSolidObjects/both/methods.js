import { Meteor } from "meteor/meteor"

import NonSolidObjects from "./class.js"

Meteor.methods({
  async "nonSolidObjects.create"(owner) {
    try {
      await NonSolidObjects.create(owner)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "nonSolidObjects.update"(nonSolidObject) {
    try {
      await NonSolidObjects.updateObjAsync(nonSolidObject)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "nonSolidObjects.remove"(nonSolidObjectId) {
    try {
      await NonSolidObjects.removeAsync(nonSolidObjectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "nonSolidObjects.removeByOwner"(sceneryId) {
    try {
      await NonSolidObjects.removeByOwner(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "nonSolidObjects.usesMaterial"(materialId) {
    try {
      return await NonSolidObjects.usesMaterial(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "nonSolidObjects.getByCalibration"(calibrationId) {
    try {
      return await NonSolidObjects.getByCalibration(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "nonSolidObjects.getById"(nonSolidObjectId) {
    try {
      return await NonSolidObjects.findOneAsync(nonSolidObjectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
