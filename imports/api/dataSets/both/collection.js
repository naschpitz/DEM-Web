import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

const DataSets = new Mongo.Collection("dataSets")

DataSets.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Calibration owner",
    optional: false,
  },
  dataType: {
    type: String,
    label: "Data type",
    optional: true,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
  },
  xData: {
    type: Array,
    label: "X data",
    optional: true,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
  },
  "xData.$": {
    type: Number,
  },
  yData: {
    type: Array,
    label: "Y data",
    optional: true,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
  },
  "yData.$": {
    type: Number,
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

export default DataSets
