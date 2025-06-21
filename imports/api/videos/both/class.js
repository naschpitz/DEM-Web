import VideosDAO from "./dao.js";

export default class Videos extends VideosDAO {
  static async setState(videoId, state, error) {
    const video = {
      _id: videoId,
      meta: {
        state: state,
        error: error
      }
    };

    await VideosDAO.updateObjAsync(video);
  }

  static async removeByOwner(sceneryId) {
    await VideosDAO.removeAsync({ "meta.owner": sceneryId });
  }
}