import { Meteor } from "meteor/meteor"
import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

import CalibrationsDAO from "./dao"
import SimulationsDAO from "../../simulations/both/dao"

const Agents = new Mongo.Collection("agents")

Agents.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Calibration Owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  simulation: {
    type: String,
    label: "Simulation Id",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  number: {
    type: Number,
    label: "Number",
    optional: false,
  },
  iteration: {
    type: Number,
    label: "Iteration",
    defaultValue: 0,
    optional: true,
  },
})

Agents.schema.addValidator(function () {
  const userId = this.userId

  if (!userId && this.connection) return "notAuthorized"

  if (this.isUpdate && this.connection) {
    const calibration = CalibrationsDAO.findOne(this.owner)
    const simulation = SimulationsDAO.findOne(calibration.owner)

    if (simulation.owner !== userId) return "notOwner"
  }
})

Agents.schema.messageBox.messages({
  en: {
    notAuthorized: "User not logged in",
    notOwner: "The user is not the simulation's owner",
  },
})

Agents.attachSchema(Agents.schema)

Meteor.isServer && Agents.rawCollection().createIndex({ owner: 1 }, { background: true })
Meteor.isServer && Agents.rawCollection().createIndex({ owner: 1, number: 1 }, { unique: true, background: true })

export default Agents
