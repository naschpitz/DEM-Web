import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

import Color from "./schemas/color.js"

const ObjectsProperties = new Mongo.Collection("objectsProperties")

ObjectsProperties.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Object owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  color: {
    type: Color,
    label: "Color",
    optional: true,
    defaultValue: {},
  },
  wireframe: {
    type: Boolean,
    label: "Wireframe",
    defaultValue: false,
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

ObjectsProperties.schema.addValidator(function () {
  const userId = this.userId

  if (!userId) return "notAuthorized"
})

ObjectsProperties.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

ObjectsProperties.attachSchema(ObjectsProperties.schema)

ObjectsProperties.rawCollection().createIndex({ owner: 1 }, { background: true })

export default ObjectsProperties
