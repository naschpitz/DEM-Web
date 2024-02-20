import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

import Simulations from "../../simulations/both/collection";

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

Groups.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"

  if (this.isUpdate && this.connection) {
    const simulation = Simulations.findOne(this.docId)

    if (simulation.owner !== userId) return "notOwner"
  }
})

Groups.schema.messageBox.messages({
  en: {
    notAuthorized: "You are not authorized to perform this action.",
    notOwner: "The user is not the group's owner.",
  },
})

Groups.attachSchema(Groups.schema)

Meteor.isServer && Groups.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Groups