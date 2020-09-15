import ObjectsProperties from '../../objectsProperties/both/class.js';
import SolidObjectsDAO from './dao.js';

export default class SolidObjects extends SolidObjectsDAO {
    static create(sceneryId) {
        const solidObjectId = this.insert({owner: sceneryId});
        ObjectsProperties.create(solidObjectId);

        return solidObjectId;
    }

    static remove(solidObjectId) {
        SolidObjectsDAO.remove(solidObjectId);
        ObjectsProperties.removeByOwner(solidObjectId);
    }

    static removeByOwner(sceneryId) {
        SolidObjectsDAO.remove({owner: sceneryId});

        const solidObjects = SolidObjectsDAO.find({owner: sceneryId}).fetch();

        solidObjects.forEach((solidObject) => {
            ObjectsProperties.removeByOwner(solidObject._id);
        });
    }

    static usesMaterial(materialId) {
        const materialFound = SolidObjects.findOne({material: materialId});

        return !!materialFound;
    }
}