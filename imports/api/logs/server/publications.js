import { Meteor } from "meteor/meteor"
import { publishComposite } from "meteor/reywood:publish-composite"

import Calibrations from "../../calibrations/both/collection"
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

  publishComposite("logs.last", function (type) {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return {
      find() {
        const simulations = Simulations.find({ owner: this.userId, primary: true }, { sort: { createdAt: -1 } })

        if (type === "simulation") {
          return simulations
        }
        if (type === "calibration") {
          const simulationIds = simulations.map(simulation => simulation._id)
          return Calibrations.find({ owner: { $in: simulationIds } }, { sort: { createdAt: -1 } })
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
