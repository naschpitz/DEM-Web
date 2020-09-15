import dot from 'dot-object';
import _ from 'lodash';

import SceneriesCol from './collection.js';

export default class SceneriesDAO {
    static find(...args) {return SceneriesCol.find(...args)}
    static findOne(...args) {return SceneriesCol.findOne(...args)}
    static insert(...args) {return SceneriesCol.insert(...args)}
    static update(...args) {return SceneriesCol.update(...args)}
    static upsert(...args) {return SceneriesCol.upsert(...args)}
    static remove(...args) {return SceneriesCol.remove(...args)}

    static updateObj(scenery) {
        const dottedScenery = dot.dot(scenery);
        const arraysPaths = getArraysPaths(scenery);

        const set = {};
        const unset = {};

        _.keys(dottedScenery).forEach((key) => {
            if (_.find(arraysPaths, (arrayPath) => (key.includes(arrayPath))))
                return;

            const value = dottedScenery[key];
            value != null ? set[key] = value : unset[key] = "";
        });

        arraysPaths.forEach((key) => {
            const value = _.get(scenery, key);
            !_.isEmpty(value) ? set[key] = value : unset[key] = "";
        });

        SceneriesCol.update(
            dottedScenery._id,
            {
                $set: set,
                $unset: unset
            }
        );
    }
}