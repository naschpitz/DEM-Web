import { Meteor } from "meteor/meteor";

import Videos from "../server/class.js";

Meteor.methods({
  async "videos.render"(sceneryId, settings) {
    try {
      this.unblock();
      await Videos.render(Meteor.userId(), sceneryId, settings);
    } catch (error) {
      throw new Meteor.Error("500", error.message);
    }
  }
});