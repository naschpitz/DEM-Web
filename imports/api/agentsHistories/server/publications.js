import { Meteor } from "meteor/meteor"

import AgentsHistoriesDAO from "../both/dao.js"

if (Meteor.isServer) {
  Meteor.publish("agentsHistories.byOwner", function (agentId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return AgentsHistoriesDAO.find({ owner: agentId })
  })
}
