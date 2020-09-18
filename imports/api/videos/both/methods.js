import { Meteor } from 'meteor/meteor';

import Videos from './class.js';

Meteor.methods({
    'videos.update'(material) {
        try {
            Videos.updateObj(material);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'videos.remove'(videoId) {
        try {
            Videos.remove(videoId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },
});