import { Meteor } from 'meteor/meteor';

import Servers from '../both/collection.js';

if (Meteor.isServer) {
    Meteor.publish('servers.list', function () {
        if (!this.userId)
            return this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        return Servers.find(
            {
                owner: this.userId,
            },
            {
                sort: {'createdAt': -1}
            }
        );
    });
}