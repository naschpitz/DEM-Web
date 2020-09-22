import _ from 'lodash';

import ObjectsPropertiesDAO from './dao.js';

export default class ObjectsProperties extends ObjectsPropertiesDAO {
    static clone(oldObjectId, newObjectId) {
        const oldObjectProperty = ObjectsPropertiesDAO.findOne({owner: oldObjectId});

        const newObjectProperty = _.clone(oldObjectProperty);
        delete newObjectProperty._id;
        newObjectProperty.owner = newObjectId;

        ObjectsPropertiesDAO.insert(newObjectProperty);
    }

    static create(objectId) {
        ObjectsPropertiesDAO.insert({owner: objectId});
    }

    static removeByOwner(objectId) {
        ObjectsPropertiesDAO.remove({owner: objectId});
    }
}