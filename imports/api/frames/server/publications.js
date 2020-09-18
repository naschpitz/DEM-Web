import { Meteor } from 'meteor/meteor';

import Frames from '../both/collection.js';

if (Meteor.isServer) {
    Meteor.publish('frames', function (sceneryId) {
        if (!this.userId)
            return this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        return Frames.find(
            {
                owner: sceneryId
            },
            {
                sort: {'step': 1}
            }
        );
    })
}