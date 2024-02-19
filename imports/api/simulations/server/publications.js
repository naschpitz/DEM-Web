import { Meteor } from "meteor/meteor"
import Simulations from "../both/collection.js"

if (Meteor.isServer) {
  Meteor.publish("simulations.compactList", function () {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Simulations.find(
      {
        owner: this.userId,
        primary: true,
      },
      {
        fields: {
          _id: 1,
          owner: 1,
          primary: 1,
          name: 1,
          state: 1,
          frameTime: 1,
          totalSteps: 1,
          timeStep: 1,
          totalTime: 1,
          createdAt: 1,
        },
        sort: { createdAt: -1 },
      }
    )
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

    return Simulations.find({ group: groupId, owner: this.userId })
  })
}
