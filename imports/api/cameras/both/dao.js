import dot from 'dot-object';
import _ from 'lodash';

import CamerasCol from './collection.js';

export default class CamerasDAO {
    static find(...args) {return CamerasCol.find(...args)}
    static findOne(...args) {return CamerasCol.findOne(...args)}
    static insert(...args) {return CamerasCol.insert(...args)}
    static update(...args) {return CamerasCol.update(...args)}
    static upsert(...args) {return CamerasCol.upsert(...args)}
    static remove(...args) {return CamerasCol.remove(...args)}

    static updateObj(camera) {
        const dottedCamera = dot.dot(camera);
        const arraysPaths = getArraysPaths(camera);

        const set = {};
        const unset = {};

        _.keys(dottedCamera).forEach((key) => {
            if (_.find(arraysPaths, (arrayPath) => (key.includes(arrayPath))))
                return;

            const value = dottedCamera[key];
            value != null ? set[key] = value : unset[key] = "";
        });

        arraysPaths.forEach((key) => {
            const value = _.get(camera, key);
            !_.isEmpty(value) ? set[key] = value : unset[key] = "";
        });

        CamerasCol.update(
            dottedCamera._id,
            {
                $set: set,
                $unset: unset
            }
        );
    }
}