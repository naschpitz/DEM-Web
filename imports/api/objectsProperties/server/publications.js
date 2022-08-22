import { Meteor } from "meteor/meteor"
import _ from "lodash"

import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import SolidObjects from "../../solidObjects/both/class.js"
import ObjectsProperties from "../both/class.js"

if (Meteor.isServer) {
  Meteor.publish("objectsProperties", function (sceneryId) {
    if (!this.userId) throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    this.autorun(function (computation) {
      const nonSolidObjects = NonSolidObjects.find({ owner: sceneryId }).fetch()
      const solidObjects = SolidObjects.find({ owner: sceneryId }).fetch()

      const objects = _.concat(nonSolidObjects, solidObjects)
      const objectsIds = objects.map(object => object._id)

      return ObjectsProperties.find({ owner: { $in: objectsIds } })
    })
  })
}
