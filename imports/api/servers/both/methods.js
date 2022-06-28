import { Meteor } from 'meteor/meteor';

import Servers from './class.js';

Meteor.methods({
    'servers.create'() {
        try {
            Servers.create();
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'servers.update'(server) {
        try {
            Servers.updateObj(server);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'servers.remove'(serverId) {
        try {
            Servers.remove(serverId);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    },

    'servers.getPostOptions'(serverId, path, data) {
        try {
            return Servers.getPostOptions(serverId, path, data)
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    }
});