import Files from "../../files/both/class";

export default class Videos extends Files {
  static async setState(fileId, state, error) {
    await super.setState(fileId, state, error);
  }

  static async removeByOwner(sceneryId) {
    await super.removeAsync({ "owner": sceneryId, "isVideo": true });
  }
}