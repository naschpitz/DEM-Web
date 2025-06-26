import Files from "../../files/both/class.js";

export default class Videos extends Files {
  static async setState(videoId, state, error) {
    await super.setState(videoId, state, error);
  }

  static async removeByOwner(sceneryId) {
    await super.removeAsync({ "owner": sceneryId, "isVideo": true });
  }


}