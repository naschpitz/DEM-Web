import { Meteor } from 'meteor/meteor';

import NonSolidObjects from './class.js';

Meteor.methods({
    'nonSolidObjects.create'(owner) {
        try {
            NonSolidObjects.create(owner);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'nonSolidObjects.update'(nonSolidObject) {
        try {
            NonSolidObjects.updateObj(nonSolidObject);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'nonSolidObjects.remove'(nonSolidObjectId) {
        try {
            NonSolidObjects.remove(nonSolidObjectId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'nonSolidObjects.removeByOwner'(sceneryId) {
        try {
            NonSolidObjects.removeByOwner(sceneryId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'nonSolidObjects.usesMaterial'(materialId) {
        try {
            return NonSolidObjects.usesMaterial(materialId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    }
});