import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

const Cameras = new Mongo.Collection("cameras")

Cameras.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Scenery owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  position: {
    type: Array,
    label: "Position",
    minCount: 1,
    maxCount: 3,
    optional: true,
    defaultValue: [0, 0, 0],
  },
  "position.$": {
    type: Number,
  },
  lookAt: {
    type: Array,
    label: "Look at",
    minCount: 1,
    maxCount: 3,
    optional: true,
    defaultValue: [0, 0, 0],
  },
  "lookAt.$": {
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

Cameras.schema.addValidator(function () {
  const userId = this.userId

  if (!userId) return "notAuthorized"
})

Cameras.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Cameras.attachSchema(Cameras.schema)

export default Cameras
