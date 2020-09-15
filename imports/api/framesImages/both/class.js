import FramesImagesDAO from './dao.js';

export default class FramesImages extends FramesImagesDAO {
    static setState(frameImageId, state) {
        FramesImagesDAO.update(
            frameImageId,
            {
                $set: {
                    state: state
                }
            }
        );
    }
}