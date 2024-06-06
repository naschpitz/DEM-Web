import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"

import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema';

const Simulations = new Mongo.Collection("simulations")

Simulations.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "User Owner",
    regEx: SimpleSchema.RegEx.Id,
    autoValue: function () {
      if (this.isInsert) {
        return this.userId || this.value
      }
      if (this.isUpdate) this.unset()
    },
  },
  primary: {
    type: Boolean,
    label: "Primary",
    defaultValue: true,
    optional: true,
  },
  group: {
    type: String,
    label: "Group",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  name: {
    type: String,
    label: "Name",
    defaultValue: "New Simulation",
    optional: true,
  },
  server: {
    type: String,
    label: "Server",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  frameTime: {
    type: Number,
    label: "Frame time",
    optional: true,
  },
  logTime: {
    type: Number,
    label: "Log time",
    defaultValue: 5,
    optional: true,
  },
  calcNeighTimeInt: {
    type: Number,
    label: "Calculate neighborhood time interval",
    optional: true,
  },
  neighDistThresMult: {
    type: Number,
    label: "Neighborhood distance threshold multiplier",
    defaultValue: 1,
    optional: true,
  },
  multiGPU: {
    type: Boolean,
    label: "Multi GPU",
    defaultValue: false,
    optional: true,
  },
  totalTime: {
    type: Number,
    label: "Total time",
    optional: true,
  },
  timeStep: {
    type: Number,
    label: "Time step",
    optional: true,
  },
  state: {
    type: String,
    label: "State",
    allowedValues: ["new", "setToRun", "running", "setToPause", "paused", "setToStop", "stopped", "done", "failed"],
    defaultValue: "new",
    optional: true,
  },
  notes: {
    type: String,
    label: "Notes",
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

Simulations.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"

  if (this.isUpdate && this.connection) {
    const simulation = Simulations.findOne(this.docId)

    if (simulation.owner !== userId) return "notOwner"
  }
})

Simulations.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Simulations.attachSchema(Simulations.schema)

Meteor.isServer && Simulations.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Simulations
