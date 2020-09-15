import NonSolidObjectsDAO from './dao.js';
import ObjectsProperties from '../../objectsProperties/both/class.js';

export default class NonSolidObjects extends NonSolidObjectsDAO {
    static create(sceneryId) {
        const nonSolidObjectId = this.insert({owner: sceneryId});
        ObjectsProperties.create(nonSolidObjectId);

        return nonSolidObjectId;
    }

    static remove(nonSolidObjectId) {
        NonSolidObjectsDAO.remove(nonSolidObjectId);
        ObjectsProperties.removeByOwner(nonSolidObjectId);
    }

    static removeByOwner(sceneryId) {
        NonSolidObjectsDAO.remove({owner: sceneryId});

        const nonSolidObjects = NonSolidObjects.find({owner: sceneryId}).fetch();

        nonSolidObjects.forEach((nonSolidObject) => {
            ObjectsProperties.removeByOwner(nonSolidObject._id);
        });
    }

    static usesMaterial(materialId) {
        const materialFound = NonSolidObjects.findOne({material: materialId});

        return !!materialFound;
    }
}