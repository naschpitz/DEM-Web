import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import SimulationsDAO from "../../simulations/both/dao";

const Calibrations = new Mongo.Collection('calibrations');

Calibrations.schema = new SimpleSchema({
    owner: {
        type: String,
        label: "Simulation Owner",
        regEx: SimpleSchema.RegEx.Id,
        optional: false,
        unique: true,
        autoValue: function () {
            if (this.isUpdate)
                this.unset();
        }
    },
    server: {
        type: String,
        label: "Server",
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    agents: {
        type: Number,
        label: "Agents",
        optional: true
    },
    domain: {
        type: Number,
        label: "Domain",
        optional: true
    },
    instances: {
        type: Number,
        label: "Instances",
        optional: true
    },
    stopDiff: {
        type: Number,
        label: "StopDiff",
        optional: true
    },
    state: {
        type: String,
        label: "State",
        allowedValues: ["new", "running", "paused", "stopped", "done"],
        defaultValue: "new",
        optional: true
    },
    createdAt: {
        type: Date,
        label: "Created at",
        optional: true,
        autoValue: function () {
            if (this.isInsert)
                return new Date();

            else if (this.isUpsert)
                return {$setOnInsert: new Date()};

            else
                this.unset();
        },
    },
    updatedAt: {
        type: Date,
        label: "Updated at",
        autoValue: function () {
            return new Date();
        }
    },
});

Calibrations.schema.addValidator(function () {
    const userId = this.userId;

    if (!userId && this.connection)
        return 'notAuthorized';

    if (this.isUpdate && this.connection) {
        const simulation = SimulationsDAO.findOne(this.owner);

        if (simulation.owner !== userId)
            return 'notOwner';
    }
});

Calibrations.schema.messageBox.messages({
    'en': {
        'notAuthorized': "User not logged in",
        'notOwner': "The user is not the simulation's owner"
    }
});

Calibrations.attachSchema(Calibrations.schema);

export default Calibrations;