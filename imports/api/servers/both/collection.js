import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

const Servers = new Mongo.Collection("servers")

Servers.schema = new SimpleSchema({
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
    defaultValue: "New Server",
    optional: true,
  },
  url: {
    type: String,
    label: "URL",
    defaultValue: "localhost",
    optional: true,
  },
  port: {
    type: Number,
    label: "Port",
    defaultValue: 8080,
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

Servers.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"
})

Servers.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Servers.attachSchema(Servers.schema)

Meteor.isServer && Servers.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Servers
