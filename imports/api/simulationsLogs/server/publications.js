import { Meteor } from 'meteor/meteor';
import { publishComposite } from 'meteor/reywood:publish-composite';

import Simulations from '../../simulations/both/collection.js';
import SimulationsLogs from '../both/collection.js';

if (Meteor.isServer) {
    Meteor.publish('simulationsLogs', function (owner, n) {
        if (!this.userId)
            return this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        return SimulationsLogs.find(
            {
                'owner': owner
            },
            {
                sort: {'createdAt': -1},
            }
        );
    });

    publishComposite('simulationsLogs.last', function () {
        if (!this.userId)
            return this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        return {
            find() {
                return Simulations.find({owner: this.userId}, {sort: {'createdAt': -1}});
            },
            children: [{
                find(simulation) {
                    return SimulationsLogs.find({owner: simulation._id, progress: {$exists: true}}, {sort: {'createdAt': -1}, limit: 1});
                },
            }]
        }
    });
}