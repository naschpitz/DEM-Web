import _ from 'lodash';

import NonSolidObjectsDAO from './dao.js';
import ObjectsProperties from '../../objectsProperties/both/class.js';

export default class NonSolidObjects extends NonSolidObjectsDAO {
    static clone(oldSceneryId, newSceneryId, materialsMap) {
        const oldNonSolidObjects = NonSolidObjects.find({owner: oldSceneryId});

        oldNonSolidObjects.forEach((oldNonSolidObject) => {
            const newNonSolidObject = _.cloneDeep(oldNonSolidObject);
            delete newNonSolidObject._id;
            newNonSolidObject.owner = newSceneryId;
            newNonSolidObject.material = materialsMap.get(oldNonSolidObject.material);

            const oldNonSolidObjectId = oldNonSolidObject._id;
            const newNonSolidObjectId = NonSolidObjectsDAO.insert(newNonSolidObject);

            ObjectsProperties.clone(oldNonSolidObjectId, newNonSolidObjectId);
        });
    }

    static create(sceneryId) {
        const nonSolidObjectId = NonSolidObjectsDAO.insert({owner: sceneryId});
        ObjectsProperties.create(nonSolidObjectId);

        return nonSolidObjectId;
    }

    static remove(nonSolidObjectId) {
        NonSolidObjectsDAO.remove(nonSolidObjectId);
        ObjectsProperties.removeByOwner(nonSolidObjectId);
    }

    static removeByOwner(sceneryId) {
        const nonSolidObjects = NonSolidObjects.find({owner: sceneryId});

        nonSolidObjects.forEach((nonSolidObject) => {
            ObjectsProperties.removeByOwner(nonSolidObject._id);
        });

        NonSolidObjectsDAO.remove({owner: sceneryId});
    }

    static usesMaterial(materialId) {
        const materialFound = NonSolidObjects.findOne({material: materialId});

        return !!materialFound;
    }
}