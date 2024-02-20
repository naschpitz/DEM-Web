import { Meteor } from "meteor/meteor"
import { publishComposite } from "meteor/reywood:publish-composite"

import Simulations from "../../simulations/both/collection"
import Logs from "../both/collection"

if (Meteor.isServer) {
  Meteor.publish("logs", function (owner) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Logs.find(
      {
        owner: owner,
      },
      {
        sort: { createdAt: -1 },
      }
    )
  })

  publishComposite("logs.last", function (primary = true, simulationsIds) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return {
      find() {
        if (simulationsIds) {
          return Simulations.find(
            { _id: { $in: simulationsIds }, owner: this.userId, primary: primary },
            { sort: { createdAt: -1 } }
          )
        } else {
          return Simulations.find({ owner: this.userId, primary: primary }, { sort: { createdAt: -1 } })
        }
      },
      children: [
        {
          find(simulation) {
            return Logs.find(
              {
                owner: simulation._id,
                progress: { $exists: true },
              },
              { sort: { createdAt: -1 }, limit: 1 }
            )
          },
        },
      ],
    }
  })
}
