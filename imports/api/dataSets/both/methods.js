import { Meteor } from "meteor/meteor"

import DataSets from "./class"

Meteor.methods({
  async "dataSets.create"(calibrationId) {
    try {
      await DataSets.create(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "dataSets.update"(dataSet) {
    try {
      await DataSets.updateObjAsync(dataSet)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "dataSets.remove"(dataSetId) {
    try {
      await DataSets.removeAsync(dataSetId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  async "dataSets.removeByOwner"(calibrationId) {
    try {
      await DataSets.removeByOwner(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
