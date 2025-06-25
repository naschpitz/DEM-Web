import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

const Parameters = new Mongo.Collection("parameters")

Parameters.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Calibration owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  type: {
    type: String,
    label: "Parameter object type",
    allowedValues: ["material", "nonSolidObject", "solidObject"],
    optional: true,
  },
  materialObject: {
    type: String,
    label: "Material or object Id",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  coefficient: {
    type: String,
    label: "Coefficient",
    optional: true,
  },
  variation: {
    type: Number,
    label: "Variation",
    optional: true,
    defaultValue: 0.05,
  },
  c1: {
    type: Number,
    label: "C1",
    optional: true,
    defaultValue: 1.5,
  },
  c2: {
    type: Number,
    label: "C2",
    optional: true,
    defaultValue: 2.0,
  },
  perturbation: {
    type: Number,
    label: "Perturbation",
    optional: true,
    defaultValue: 0.01,
  },
  allowNegative: {
    type: Boolean,
    label: "Allow negative",
    optional: true,
    defaultValue: false,
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

Parameters.attachSchema(Parameters.schema)

Meteor.isServer && Parameters.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Parameters
