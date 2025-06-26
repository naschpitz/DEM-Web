import { Meteor } from "meteor/meteor";

import Videos from "./class.js";

Meteor.methods({
  async "videos.render"(sceneryId, settings) {
    try {
      this.unblock();
      await Videos.render(Meteor.userId(), sceneryId, settings);
    } catch (error) {
      throw new Meteor.Error("500", error.message);
    }
  },

  async "videos.update"(video) {
    try {
      await Videos.updateObjAsync(video);
    } catch (error) {
      throw new Meteor.Error("500", error.message);
    }
  },

  async "videos.remove"(fileId) {
    try {
      await Videos.removeAsync(fileId);
    } catch (error) {
      throw new Meteor.Error("500", error.message);
    }
  }
});
