import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

import Scenery from "./schemas/scenery.js"

const Frames = new Mongo.Collection("frames")

Frames.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    optional: false,
  },
  time: {
    type: Number,
    label: "Time",
    optional: true,
  },
  step: {
    type: Number,
    label: "Step",
    optional: true,
  },
  scenery: {
    type: Scenery,
    label: "Scenery",
    optional: false,
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

Frames.attachSchema(Frames.schema)

Meteor.isServer && Frames.rawCollection().createIndex({ owner: 1 }, { background: true })
Meteor.isServer && Frames.rawCollection().createIndex({ owner: 1, step: 1 }, { unique: true, background: true })

export default Frames
