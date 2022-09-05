import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

import Dimensions from "../../sharedSchemas/dimensions.js"

const NonSolidObjects = new Mongo.Collection("nonSolidObjects")

NonSolidObjects.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  name: {
    type: String,
    label: "Name",
    defaultValue: "New Non-Solid Object",
    optional: true,
  },
  material: {
    type: String,
    label: "Material",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  fixed: {
    type: Boolean,
    label: "Fixed",
    optional: true,
  },
  density: {
    type: Number,
    label: "Density",
    optional: true,
  },
  dimensions: {
    type: Dimensions,
    label: "Dimensions",
    optional: true,
  },
  position: {
    type: Array,
    label: "Position",
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
    label: "Velocity",
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

NonSolidObjects.schema.addValidator(function () {
  const userId = this.userId

  if (!userId) return "notAuthorized"
})

NonSolidObjects.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

NonSolidObjects.attachSchema(NonSolidObjects.schema)

NonSolidObjects.rawCollection().createIndex({ owner: 1 }, { background: true })

export default NonSolidObjects
