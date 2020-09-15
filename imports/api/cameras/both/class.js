import CamerasDAO from './dao.js';

export default class Cameras extends CamerasDAO {
    static create(sceneryId) {
        return CamerasDAO.insert({owner: sceneryId});
    }

    static removeByOwner(sceneryId) {
        CamerasDAO.remove({owner: sceneryId});
    }
}