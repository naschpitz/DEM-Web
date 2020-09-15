import dot from 'dot-object';
import _ from 'lodash';

import FramesImagesCol from './collection.js';

export default class FramesImagesDAO {
    static find(...args) {return FramesImagesCol.find(...args)}
    static findOne(...args) {return FramesImagesCol.findOne(...args)}
    static insert(...args) {return FramesImagesCol.insert(...args)}
    static update(...args) {return FramesImagesCol.update(...args)}
    static upsert(...args) {return FramesImagesCol.upsert(...args)}
    static remove(...args) {return FramesImagesCol.remove(...args)}

    static updateObj(frameImage) {
        const dottedFrameImage = dot.dot(frameImage);

        const set = {};
        const unset = {};

        _.keys(dottedFrameImage).forEach((key) => {
            const value = dottedFrameImage[key];
            value != null ? set[key] = value : unset[key] = "";
        });

        FramesImagesCol.update(
            frameImage._id,
            {
                $set: set,
                $unset: unset
            }
        );
    }
}