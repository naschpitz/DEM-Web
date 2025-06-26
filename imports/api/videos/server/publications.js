import { Meteor } from "meteor/meteor";

import Videos from "../both/class.js";

if (Meteor.isServer) {
  // Video-specific publication
  Meteor.publish("videos", function(owner) {
    if (!this.userId)
      throw this.error(new Meteor.Error("401", "Unauthorized", "User not logged in."));

    return Videos.find({ "owner": owner, "isVideo": true });
  });
}
