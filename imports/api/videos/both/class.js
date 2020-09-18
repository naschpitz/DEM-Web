import VideosDAO from './dao.js';

export default class Videos extends VideosDAO {
    static setState(videoId, state) {
        const video = {
            _id: videoId,
            'meta.state': state
        };

        VideosDAO.updateObj(video);
    }
}