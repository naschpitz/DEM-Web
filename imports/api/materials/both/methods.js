import { Meteor } from "meteor/meteor"

import Materials from "./class.js"

Meteor.methods({
  async "materials.create"(owner) {
    try {
      await Materials.create(owner)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "materials.update"(material) {
    try {
      await Materials.updateObjAsync(material)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "materials.usesMaterial"(materialId) {
    try {
      await Materials.usesMaterial(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "materials.remove"(materialId) {
    try {
      await Materials.removeAsync(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "materials.removeByOwner"(sceneryId) {
    try {
      await Materials.removeAsync({ owner: sceneryId })
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "materials.getByCalibration"(calibrationId) {
    try {
      return await Materials.getByCalibration(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  async "materials.getById"(materialId) {
    try {
      return await Materials.findOneAsync(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
