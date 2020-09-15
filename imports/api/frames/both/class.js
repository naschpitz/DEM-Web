import _ from 'lodash';

import FramesDAO from './dao.js';

export default class Frames extends FramesDAO {
    static getData(sceneryId, objectId, dataName, minInterval, maxInterval) {
        const filter = [];

        if (minInterval)
            filter.push({time: {$gte: minInterval}});

        if (maxInterval)
            filter.push({time: {$lte: maxInterval}});

        const selector = {
            'scenery._id': sceneryId,
            $or: [
                {'scenery.objects.nonSolidObjects._id': objectId},
                {'scenery.objects.solidObjects._id': objectId}
            ]
        };

        if (minInterval || maxInterval)
            selector.$and = filter;

        const frames = FramesDAO.find(selector).fetch();

        let data = "";

        frames.forEach((frame) => {
            let object = null;

            const nonSolidObjects = _.get(frame, 'scenery.objects.nonSolidObjects', null);

            if (nonSolidObjects) {
                object = nonSolidObjects.find((nonSolidObject) => nonSolidObject._id === objectId);
            }

            const solidObjects = _.get(frame, 'scenery.objects.solidObjects', null);

            if (solidObjects && !object) {
                object = solidObjects.find((solidObject) => solidObject._id === objectId);
            }

            data += frame.time + "\t" + _.get(object, dataName) + "\n";
        });

        return data;
    }
}