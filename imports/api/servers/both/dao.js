import dot from 'dot-object';
import _ from 'lodash';

import ServersCol from './collection.js';

export default class ServersDAO {
    static find(...args) {return ServersCol.find(...args)}
    static findOne(...args) {return ServersCol.findOne(...args)}
    static insert(...args) {return ServersCol.insert(...args)}
    static update(...args) {return ServersCol.update(...args)}
    static upsert(...args) {return ServersCol.upsert(...args)}
    static remove(...args) {return ServersCol.remove(...args)}

    static updateObj(server) {
        const dottedServer = dot.dot(server);

        const set = {};
        const unset = {};

        _.keys(dottedServer).forEach((key) => {
            const value = dottedServer[key];
            value != null ? set[key] = value : unset[key] = "";
        });

        ServersCol.update(
            dottedServer._id,
            {
                $set: set,
                $unset: unset
            }
        );
    }
}