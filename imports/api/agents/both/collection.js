import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

import CalibrationsDAO from "../../calibrations/both/dao"
import SimulationsDAO from "../../simulations/both/dao"

import SimulationScore from "./schemas/simulationScore"

const Agents = new Mongo.Collection("agents")

Agents.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Calibration Owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  current: {
    type: SimulationScore,
    label: "Current",
    optional: false,
  },
  best: {
    type: SimulationScore,
    label: "Best",
    optional: true,
  },
  index: {
    type: Number,
    label: "Index",
    optional: false,
  },
  iteration: {
    type: Number,
    label: "Iteration",
    defaultValue: 0,
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

Agents.attachSchema(Agents.schema)

Meteor.isServer && Agents.rawCollection().createIndex({ owner: 1 }, { background: true })
Meteor.isServer && Agents.rawCollection().createIndex({ owner: 1, index: 1 }, { unique: true, background: true })

export default Agents
