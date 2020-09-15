import { Meteor } from 'meteor/meteor';

import Cameras from './class.js';

Meteor.methods({
    'cameras.create'(sceneryId) {
        try {
            Cameras.create(sceneryId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'cameras.update'(camera) {
        try {
            Cameras.updateObj(camera);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'cameras.removeByOwner'(sceneryId) {
        try {
            Cameras.remove(sceneryId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    }
});