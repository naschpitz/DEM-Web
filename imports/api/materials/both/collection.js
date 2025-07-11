import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import { Random } from "meteor/random"
import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

const Materials = new Mongo.Collection("materials")

Materials.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  callSign: {
    type: String,
    label: "Call sign",
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      if (this.isUpdate) return

      if (!this.isSet) {
        return Random.id()
      }
    },
    optional: true,
  },
  name: {
    type: String,
    label: "Name",
    defaultValue: "New Material",
    optional: true,
  },
  material1: {
    type: String,
    label: "Material 1",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  material2: {
    type: String,
    label: "Material 2",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  distanceThreshold: {
    type: Number,
    label: "Distance threshold",
    defaultValue: 1,
    optional: true,
  },
  forceType: {
    type: String,
    label: "Force type",
    optional: true,
    allowedValues: [
      "adiabatic_compression",
      "hooks_law",
      "inverse_linear",
      "inverse_quadratic",
      "inverse_cubic",
      "morse",
      "lennard_jones",
      "realistic_material",
    ],
  },
  dragForceType: {
    type: String,
    label: "Drag force type",
    optional: true,
    allowedValues: ["linear", "quadratic", "cubic"],
  },
  coefficients: {
    type: Array,
    label: "Coefficients",
    optional: true,
  },
  "coefficients.$": {
    type: Number,
  },
  dragCoefficients: {
    type: Array,
    label: "Drag coefficients",
    optional: true,
  },
  "dragCoefficients.$": {
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

Materials.attachSchema(Materials.schema)

Meteor.isServer && Materials.rawCollection().createIndex({ owner: 1, callSign: 1 }, { unique: true, background: true })

export default Materials
