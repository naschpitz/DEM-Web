import { Meteor } from 'meteor/meteor';

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

    Meteor.publish('simulationsLogs.last', function () {
        if (!this.userId)
            return this.error(new Meteor.Error('401', "Unauthorized", "User not logged in."));

        this.autorun(function (computation) {
            const simulations = Simulations.find({owner: this.userId}, {sort: {'createdAt': -1}});
            const simulationsIds = simulations.map((simulation) => (simulation._id));

            const simulationsLogs = SimulationsLogs.find({owner: {$in: simulationsIds}, progress: {$exists: true}}, {sort: {'createdAt': -1}, limit: 1});

            return [ simulations, simulationsLogs ];
        });
    });
}