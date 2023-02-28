import { Meteor } from "meteor/meteor"

import Agents from "../both/class"

// TODO: Add a check for the user's role, improve security

if (Meteor.isServer) {
  Meteor.publish("agents.list", function (calibrationId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Agents.find({ owner: calibrationId })
  })

  Meteor.publish("agents.agent", function (agentId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Agents.find({ _id: agentId })
  })
}
