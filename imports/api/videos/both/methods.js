import { Meteor } from "meteor/meteor";

import Videos from "./class.js";

Meteor.methods({
  async "videos.update"(material) {
    try {
      await Videos.updateObjAsync(material);
    } catch (error) {
      throw new Meteor.Error("500", error.message);
    }
  },

  async "videos.remove"(videoId) {
    try {
      await Videos.removeAsync(videoId);
    } catch (error) {
      throw new Meteor.Error("500", error.message);
    }
  }
});