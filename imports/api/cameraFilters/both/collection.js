import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

const Cameras = new Mongo.Collection("cameras")

Cameras.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  axis: {
    type: String,
    label: "Axis",
    optional: true,
    allowedValues: ["x", "y", "z"],
  },
  min: {
    type: Number,
    label: "Min",
    optional: true,
  },
  max: {
    type: Number,
    label: "Max",
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

Cameras.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"
})

Cameras.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Cameras.attachSchema(Cameras.schema)

Meteor.isServer && Cameras.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Cameras
