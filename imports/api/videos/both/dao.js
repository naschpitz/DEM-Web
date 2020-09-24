import dot from "dot-object";
import _ from "lodash";

import VideosCol from './collection.js';

export default class VideosDAO {
    static addFile(...args) {return VideosCol.addFile(...args)}
    static find(...args) {return VideosCol.find(...args)}
    static findOne(...args) {return VideosCol.findOne(...args)}
    static insert(...args) {return VideosCol.insert(...args)}
    static update(...args) {return VideosCol.update(...args)}
    static upsert(...args) {return VideosCol.upsert(...args)}
    static remove(...args) {return VideosCol.remove(...args)}

    static updateObj(video) {
        const error = _.get(video, 'meta.error');

        // Removes circular reference.
        if (_.get(error, 'error'))
            delete error.error;

        const dottedVideo = dot.dot(video);

        const set = {};
        const unset = {};

        _.keys(dottedVideo).forEach((key) => {
            const value = dottedVideo[key];
            value != null ? set[key] = value : unset[key] = "";
        });

        VideosCol.update(
            video._id,
            {
                $set: set,
                $unset: unset
            }
        );
    }
}