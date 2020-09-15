import dot from 'dot-object';
import _ from 'lodash';

import SolidObjectsCol from './collection.js';

export default class SolidObjects {
    static find(...args) {return SolidObjectsCol.find(...args)}
    static findOne(...args) {return SolidObjectsCol.findOne(...args)}
    static insert(...args) {return SolidObjectsCol.insert(...args)}
    static update(...args) {return SolidObjectsCol.update(...args)}
    static upsert(...args) {return SolidObjectsCol.upsert(...args)}
    static remove(...args) {return SolidObjectsCol.remove(...args)}

    static updateObj(solidObject) {
        const dottedSolidObject = dot.dot(solidObject);
        const arraysPaths = getArraysPaths(solidObject);

        const set = {};
        const unset = {};

        _.keys(dottedSolidObject).forEach((key) => {
            if (_.find(arraysPaths, (arrayPath) => (key.includes(arrayPath))))
                return;

            const value = dottedSolidObject[key];
            value != null ? set[key] = value : unset[key] = "";
        });

        arraysPaths.forEach((key) => {
            const value = _.get(solidObject, key);
            !_.isEmpty(value) ? set[key] = value : unset[key] = "";
        });

        SolidObjectsCol.update(
            dottedSolidObject._id,
            {
                $set: set,
                $unset: unset
            }
        );
    }
}
