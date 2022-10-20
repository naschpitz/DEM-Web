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
}
