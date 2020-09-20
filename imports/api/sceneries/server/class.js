import Cameras from '../../cameras/both/class.js';
import Frames from '../../frames/server/class.js';
import Materials from '../../materials/both/class.js';
import NonSolidObjects from '../../nonSolidObjects/both/class.js';
import SceneriesBoth from '../../sceneries/both/class.js';
import SolidObjects from '../../solidObjects/both/class.js';

export default class Sceneries extends SceneriesBoth {
    static resetByOwner(simulationId) {
        const scenery = SceneriesBoth.findOne({owner: simulationId});

        Frames.removeByOwner(scenery._id);
    }

    static removeByOwner(simulationId) {
        const scenery = SceneriesBoth.findOne({owner: simulationId});
        const sceneryId = scenery._id;

        SceneriesBoth.remove(sceneryId);

        Frames.removeByOwner(sceneryId);
        NonSolidObjects.removeByOwner(sceneryId);
        SolidObjects.removeByOwner(sceneryId);
        Materials.removeByOwner(sceneryId);
        Cameras.removeByOwner(sceneryId);
    }
}