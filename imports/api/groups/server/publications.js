import { Meteor } from "meteor/meteor"

import Groups from "../both/collection"

if (Meteor.isServer) {
  Meteor.publish("groups.list", function () {
    if (!this.userId) return this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."))

    return Groups.find(
      {
        owner: this.userId,
      },
      {
        sort: { createdAt: -1 },
      }
    )
  })
}
