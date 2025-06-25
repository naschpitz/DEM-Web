import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

const Sceneries = new Mongo.Collection("sceneries")

Sceneries.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Simulation owner",
    optional: false,
  },
  storage: {
    type: String,
    defaultValue: "local",
    allowedValues: ["local", "s3"],
  },
  gravity: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "gravity.$": {
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

Sceneries.attachSchema(Sceneries.schema)

Meteor.isServer && Sceneries.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Sceneries
