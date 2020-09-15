import { Meteor } from 'meteor/meteor';

import FramesImages from '../both/collection.js';

if (Meteor.isServer) {
    Meteor.publish('framesImages.byOwner', function (frameId) {
        if (!this.userId)
            return this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        return FramesImages.find({owner: frameId});
    })
}