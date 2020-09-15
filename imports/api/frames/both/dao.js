import _ from 'lodash';

import FramesCol from './collection.js';

export default class FramesDAO {
    static find(...args) {return FramesCol.find(...args)}
    static findOne(...args) {return FramesCol.findOne(...args)}
    static update(...args) {return FramesCol.update(...args)}
    static upsert(...args) {return FramesCol.upsert(...args)}
    static remove(...args) {return FramesCol.remove(...args)}

    static insert(frame) {
        const scenery = frame.scenery;

        const nonSolidObjects = _.get(scenery, 'objects.nonSolidObjects', []);
        const solidObjects = _.get(scenery, 'objects.solidObjects', []);

        nonSolidObjects.forEach((nonSolidObject) => {
            delete nonSolidObject.particles;
        });

        solidObjects.forEach((solidObject) => {
            delete solidObject.faces;
        });

        // As the 'Frame' schema has no 'particles' or 'faces' in 'nonSolidObject' and 'solidObject' respectively, they
        // will not be pushed into the collection automatically, in theory. SimplSchema is painfully slow to validate
        // (and clean) large documents, so a better idea was to remove those unnecessary fields prior to insertion.
        FramesCol.insert(frame);
    }
}