import { Meteor } from "meteor/meteor"

import SolidObjects from "./class.js"

Meteor.methods({
  "solidObjects.create"(sceneryId) {
    try {
      SolidObjects.create(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "solidObjects.update"(solidObject) {
    try {
      SolidObjects.updateObj(solidObject)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "solidObjects.remove"(solidObjectId) {
    try {
      SolidObjects.remove(solidObjectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "solidObjects.removeByOwner"(sceneryId) {
    try {
      SolidObjects.removeByOwner(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "solidObjects.usesMaterial"(materialId) {
    try {
      return SolidObjects.usesMaterial(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "solidObjects.getByCalibration"(calibrationId) {
    try {
      return SolidObjects.getByCalibration(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "solidObjects.getById"(solidObjectId) {
    try {
      return SolidObjects.findOne(solidObjectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
