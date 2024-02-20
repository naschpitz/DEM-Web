import { Meteor } from "meteor/meteor"
import Simulations from "../both/collection.js"

if (Meteor.isServer) {
  Meteor.publish("simulations.list", function () {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Simulations.find({ owner: this.userId, primary: true })
  })

  Meteor.publish("simulations.simulation", function (simulationId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Simulations.find({ _id: simulationId, owner: this.userId })
  })

  Meteor.publish("simulations.byIds", function (simulationsIds) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    // If simulationsIds is a string, convert it to an array
    if (typeof simulationsIds === "string") simulationsIds = [simulationsIds]

    return Simulations.find({ _id: { $in: simulationsIds }, owner: this.userId })
  })

  Meteor.publish("simulations.byGroup", function (groupId) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    if (groupId)
      return Simulations.find({ owner: this.userId, group: groupId, primary: true })

    // If groupId is not defined, return only the primary simulations not in a group
    return Simulations.find({ owner: this.userId, group: { $exists: false }, primary: true})
  })
}
