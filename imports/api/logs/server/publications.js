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

  publishComposite("logs.last", function (primary = true, ids) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return {
      find() {
        if (ids) {
          return Simulations.find(
            { _id: { $in: ids }, owner: this.userId, primary: primary },
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
