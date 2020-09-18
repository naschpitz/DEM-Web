import { Meteor } from 'meteor/meteor';

import Videos from './class.js';

if (Meteor.isServer) {
    Meteor.publish('videos', function (sceneryId) {
        if (!this.userId)
            throw this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        return Videos.find({'meta.owner': sceneryId}).cursor;
    });
}