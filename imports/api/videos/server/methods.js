import { Meteor } from 'meteor/meteor';

import Videos from '../server/class.js';

Meteor.methods({
    'videos.render'(sceneryId, settings) {
        async function render(...args) {
            Videos.render(...args);
        }

        try {
            this.unblock();
            render(Meteor.userId(), sceneryId, settings);
        }

        catch (error) {
            throw new Meteor.Error('500', error.message);
        }
    }
});