import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

import Data from "./schemas/data.js"

const DataSets = new Mongo.Collection("dataSets")

DataSets.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Calibration owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  object: {
    type: String,
    label: "Object",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
  },
  dataName: {
    type: String,
    label: "Data name",
    allowedValues: [
      "position[0]",
      "position[1]",
      "position[2]",
      "velocity[0]",
      "velocity[1]",
      "velocity[2]",
      "force[0]",
      "force[1]",
      "force[2]",
      "kineticEnergyTotal",
      "kineticEnergyExternal",
      "kineticEnergyInternal",
    ],
    optional: true,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
  },
  data: {
    type: Array,
    label: "Data",
    optional: true,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
  },
  "data.$": {
    type: Data,
    label: "Data",
    optional: true,
  },
  createdAt: {
    type: Date,
    label: "Created at",
    optional: true,
    autoValue: function () {
      if (this.isInsert) return new Date()
      else if (this.isUpsert) return { $setOnInsert: new Date() }
      else this.unset()
    },
  },
  updatedAt: {
    type: Date,
    label: "Updated at",
    autoValue: function () {
      return new Date()
    },
  },
})

DataSets.schema.addValidator(function () {
  const userId = this.userId

  if (!userId) return "notAuthorized"
})

DataSets.schema.messageBox.messages({
  en: {
    missingField: "{{name}} is required",
  },
})

DataSets.attachSchema(DataSets.schema)

Meteor.isServer && DataSets.rawCollection().createIndex({ owner: 1 }, { background: true })

export default DataSets
