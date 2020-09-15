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
        const server = Servers.findOne(serverId);

        return {
            url: "http://" + server.url + ":" + server.port + path,
            data: data,
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }
    }
});