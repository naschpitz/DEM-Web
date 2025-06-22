import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import { Random } from "meteor/random"
import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

const SolidObjects = new Mongo.Collection("solidObjects")

SolidObjects.schema = new SimpleSchema({
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
    defaultValue: "New Solid Object",
    optional: true,
  },
  material: {
    type: String,
    label: "Material",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  stl: {
    type: String,
    label: "STL",
    optional: true,
  },
  fixed: {
    type: Boolean,
    label: "Fixed",
    defaultValue: false,
    optional: true,
  },
  mass: {
    type: Number,
    label: "Mass",
    optional: true,
  },
  position: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "position.$": {
    type: Number,
  },
  velocity: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "velocity.$": {
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

SolidObjects.attachSchema(SolidObjects.schema)

Meteor.isServer && SolidObjects.rawCollection().createIndex({ owner: 1 }, { background: true })

export default SolidObjects
