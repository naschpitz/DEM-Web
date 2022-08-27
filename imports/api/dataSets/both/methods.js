import { Meteor } from "meteor/meteor"

import DataSets from "./class.js"

Meteor.methods({
  "dataSets.create"(calibrationId) {
    try {
      DataSets.create(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "dataSets.update"(dataSet) {
    try {
      DataSets.updateObj(dataSet)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "dataSets.remove"(dataSetId) {
    try {
      DataSets.remove(dataSetId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "dataSets.removeByOwner"(calibrationId) {
    try {
      DataSets.removeByOwner(calibrationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
