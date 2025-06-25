import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

import Simulations from "../../simulations/both/collection"

const Groups = new Mongo.Collection("groups")

Groups.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "User Owner",
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      if (this.isInsert) return this.userId
      if (this.isUpdate) this.unset()
    },
  },
  name: {
    type: String,
    label: "Name",
    defaultValue: "New Group",
    optional: true,
  },
  description: {
    type: String,
    label: "Description",
    defaultValue: "",
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

Groups.attachSchema(Groups.schema)

Meteor.isServer && Groups.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Groups
