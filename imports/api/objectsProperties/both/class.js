import ObjectsPropertiesDAO from './dao.js';

export default class ObjectsProperties extends ObjectsPropertiesDAO {
    static create(objectId) {
        return this.insert({owner: objectId});
    }

    static removeByOwner(objectId) {
        this.remove({owner: objectId});
    }
}