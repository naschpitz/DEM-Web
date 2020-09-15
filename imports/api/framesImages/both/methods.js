import { Meteor } from 'meteor/meteor';

import FramesImages from './class.js';

Meteor.methods({
    'framesImages.setState'(frameImageId, state) {
        try {
            FramesImages.setState(frameImageId, state);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'framesImages.update'(frameImage) {
        try {
            FramesImages.updateObj(frameImage);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'framesImages.removeByOwners'(framesIds) {
        try {
            FramesImages.remove(
                {
                    owner: {$in: framesIds}
                }
            );
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    }
});