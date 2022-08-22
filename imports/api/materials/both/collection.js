import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

const Materials = new Mongo.Collection("materials")

Materials.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
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

Materials.schema.addValidator(function () {
  const userId = this.userId

  if (!userId) return "notAuthorized"
})

Materials.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Materials.attachSchema(Materials.schema)

export default Materials
