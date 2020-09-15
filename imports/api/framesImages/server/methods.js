import { Meteor } from 'meteor/meteor';

import FramesImages from './class.js';

Meteor.methods({
    'framesImages.render'(frameId, dimensions) {
        try {
            FramesImages.render(frameId, dimensions);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'framesImages.dispatchPovray'(frameImage) {
        try {
            FramesImages.dispatchPovray(frameImage);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    }
});