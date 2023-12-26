import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

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
    defaultValue: 0.05
  },
  perturbation: {
    type: Number,
    label: "Perturbation",
    optional: true,
    defaultValue: 0.005
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

Parameters.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"
})

Parameters.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Parameters.attachSchema(Parameters.schema)

Meteor.isServer && Parameters.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Parameters
