import { Meteor } from "meteor/meteor"

import Materials from "./class.js"

Meteor.methods({
  "materials.create"(owner) {
    try {
      Materials.create(owner)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "materials.update"(material) {
    try {
      Materials.updateObj(material)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "materials.usesMaterial"(materialId) {
    try {
      Materials.usesMaterial(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "materials.remove"(materialId) {
    try {
      Materials.remove(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "materials.removeByOwner"(sceneryId) {
    Materials.remove({ owner: sceneryId }, error => {
      if (error) throw new Meteor.Error("500", error.message)
    })
  },

  "materials.getByCalibration"(calibrationId) {
    try {
      return Materials.getByCalibration(calibrationId)
    } catch (error) {
      throw new Meteor.Error(error.code, error.message)
    }
  },

  "materials.getById"(materialId) {
    try {
      return Materials.findOne(materialId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
