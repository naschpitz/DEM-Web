import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"
import _ from "lodash"

import Sceneries from "../../sceneries/both/class"
import Simulations from "../../simulations/both/class"

// Create a simple Mongo collection for file metadata
const Files = new Mongo.Collection("files")

Files.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    regEx: SimpleSchema.RegEx.Id,
    denyUpdate: true,
  },
  name: {
    type: String,
    label: "Name",
  },
  path: {
    type: String,
    label: "File path",
  },
  size: {
    type: Number,
    label: "File size",
    optional: true,
  },
  type: {
    type: String,
    label: "MIME type",
    optional: true,
  },
  isVideo: {
    type: Boolean,
    label: "Is video",
    optional: true,
  },
  isAudio: {
    type: Boolean,
    label: "Is audio",
    optional: true,
  },
  isImage: {
    type: Boolean,
    label: "Is image",
    optional: true,
  },
  isText: {
    type: Boolean,
    label: "Is text",
    optional: true,
  },
  isJSON: {
    type: Boolean,
    label: "Is JSON",
    optional: true,
  },
  isPDF: {
    type: Boolean,
    label: "Is PDF",
    optional: true,
  },
  state: {
    type: String,
    label: "State",
    optional: true,
  },
  error: {
    type: Object,
    label: "Error",
    optional: true,
    blackbox: true,
  },
  notes: {
    type: String,
    label: "Notes",
    optional: true,
    max: 300,
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

Files.schema.messageBox.messages({})

Files.attachSchema(Files.schema)

Meteor.isServer && Files.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Files
