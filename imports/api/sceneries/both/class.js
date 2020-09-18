import Cameras from '../../cameras/both/class.js';
import SceneriesDAO from './dao.js';

export default class Sceneries extends SceneriesDAO {
    static create(simulationId) {
        const sceneryId = this.insert({owner: simulationId});
        Cameras.create(sceneryId);

        return sceneryId;
    }
}