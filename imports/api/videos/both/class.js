import VideosDAO from './dao.js';

export default class Videos extends VideosDAO {
    static setState(videoId, state, error) {
        const video = {
            _id: videoId,
            meta: {
                state: state,
                error: error
            }
        };

        VideosDAO.updateObj(video);
    }
}