import Cameras from '../../cameras/both/class.js';
import Materials from '../../materials/both/class.js';
import NonSolidObjects from '../../nonSolidObjects/both/class.js';
import SceneriesDAO from './dao.js';
import SolidObjects from '../../solidObjects/both/class.js';

export default class Sceneries extends SceneriesDAO {
    static create(simulationId) {
        const sceneryId = this.insert({owner: simulationId});
        Cameras.create(sceneryId);

        return sceneryId;
    }

    static removeByOwner(simulationId) {
        const scenery = Sceneries.findOne({owner: simulationId});
        const sceneryId = scenery._id;

        this.remove(sceneryId);

        NonSolidObjects.removeByOwner(sceneryId);
        SolidObjects.removeByOwner(sceneryId);
        Materials.removeByOwner(sceneryId);
        Cameras.removeByOwner(sceneryId);
    }
}