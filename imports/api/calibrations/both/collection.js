import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

import SimulationsDAO from "../../simulations/both/dao"

const Calibrations = new Mongo.Collection("calibrations")

Calibrations.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Simulation Owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
    autoValue: function () {
      if (this.isUpdate) this.unset()
    },
  },
  server: {
    type: String,
    label: "Server",
    regEx: SimpleSchema.RegEx.Id,
    optional: true,
  },
  currentIteration: {
    type: Number,
    label: "Current Iteration",
    defaultValue: 0,
    optional: true,
  },
  agentsNumber: {
    type: Number,
    label: "Agents",
    defaultValue: 20,
    optional: true,
  },
  instancesNumber: {
    type: Number,
    label: "Instances",
    defaultValue: 2,
    optional: true,
  },
  maxIterations: {
    type: Number,
    label: "Maximum number of iterations",
    defaultValue: 20,
    optional: true,
  },
  maxEnergy: {
    type: Number,
    label: "Maximum Energy",
    optional: true,
  },
  numIntervals: {
    type: Number,
    label: "Number of intervals to check",
    defaultValue: 3,
    optional: true,
  },
  minPercentage: {
    type: Number,
    label: "Minimum Percentage",
    defaultValue: 0.01,
    optional: true,
  },
  state: {
    type: String,
    label: "State",
    allowedValues: ["new", "running", "paused", "stopped", "done"],
    defaultValue: "new",
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

Calibrations.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"

  if (this.isUpdate && this.connection) {
    const simulation = SimulationsDAO.findOne(this.owner)

    if (simulation.owner !== userId) return "notOwner"
  }
})

Calibrations.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Calibrations.attachSchema(Calibrations.schema)

Meteor.isServer && Calibrations.rawCollection().createIndex({ owner: 1 }, { background: true })

export default Calibrations
