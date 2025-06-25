import { Mongo } from "meteor/mongo"
import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

import AgentsDAO from "../../agents/both/dao"
import CalibrationsDAO from "../../agents/both/dao"
import SimulationsDAO from "../../simulations/both/dao"

import SimulationScore from "./schemas/simulationScore"

const AgentsHistories = new Mongo.Collection("agentsHistories")

AgentsHistories.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Agent Owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  iteration: {
    type: Number,
    label: "Iteration",
    defaultValue: 0,
    optional: true,
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

AgentsHistories.attachSchema(AgentsHistories.schema)

Meteor.isServer && AgentsHistories.rawCollection().createIndex({ owner: 1 }, { background: true })

export default AgentsHistories
