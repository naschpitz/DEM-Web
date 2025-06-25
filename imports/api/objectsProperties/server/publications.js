import { Meteor } from "meteor/meteor"
import { publishComposite } from "meteor/reywood:publish-composite"

import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import SolidObjects from "../../solidObjects/both/class.js"
import ObjectsProperties from "../both/class.js"

if (Meteor.isServer) {
  publishComposite("objectsProperties", function (sceneryId) {
    if (!this.userId) {
      throw new Meteor.Error("401", "Unauthorized", "User not logged in.")
    }

    return [
      {
        find() {
          return NonSolidObjects.find({ owner: sceneryId })
        },
        children: [
          {
            find(object) {
              return ObjectsProperties.find({ owner: object._id })
            },
          },
        ],
      },
      {
        find() {
          return SolidObjects.find({ owner: sceneryId })
        },
        children: [
          {
            find(object) {
              return ObjectsProperties.find({ owner: object._id })
            },
          },
        ],
      },
    ]
  })
}
