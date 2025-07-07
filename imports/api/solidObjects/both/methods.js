import { Meteor } from "meteor/meteor"

import SolidObjects from "./class"

Meteor.methods({
  async "solidObjects.create"(sceneryId) {
    try {
      await SolidObjects.create(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "solidObjects.update"(solidObject) {
    try {
      await SolidObjects.updateObjAsync(solidObject)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "solidObjects.remove"(solidObjectId) {
    try {
      await SolidObjects.removeAsync(solidObjectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "solidObjects.removeByOwner"(sceneryId) {
    try {
      await SolidObjects.removeByOwner(sceneryId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "solidObjects.usesMaterial"(materialId) {
    try {
      return await SolidObjects.usesMaterial(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "solidObjects.getByCalibration"(calibrationId) {
    try {
      return await SolidObjects.getByCalibration(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "solidObjects.getById"(solidObjectId) {
    try {
      return await SolidObjects.findOneAsync(solidObjectId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
