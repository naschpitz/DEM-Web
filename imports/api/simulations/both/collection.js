import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Simulations = new Mongo.Collection('simulations');

Simulations.schema = new SimpleSchema({
    owner: {
        type: String,
        label: "User Owner",
        regEx: SimpleSchema.RegEx.Id,
        autoValue: function () {
            if (this.isInsert)
                return this.userId;

            if (this.isUpdate)
                this.unset();
        }
    },
    name: {
        type: String,
        label: "Name",
        defaultValue: "New Simulation",
        optional: true
    },
    server: {
        type: String,
        label: "Server",
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    frameTime: {
        type: Number,
        label: "Frame time",
        optional: true
    },
    logTime: {
        type: Number,
        label: "Log time",
        defaultValue: 5,
        optional: true
    },
    totalTime: {
        type: Number,
        label: "Total time",
        optional: true
    },
    timeStep: {
        type: Number,
        label: "Time step",
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

Simulations.schema.addValidator(function () {
    const userId = this.userId;

    if (!userId && this.connection)
        return 'notAuthorized';

    if (this.isUpdate && this.connection) {
        const simulation = Simulations.findOne(this.docId);

        if (simulation.owner !== userId)
            return 'notOwner';
    }
});

Simulations.schema.messageBox.messages({
    'en': {
        'notAuthorized': "User not logged in",
        'notOwner': "The user is not the simulation's owner"
    }
});

Simulations.attachSchema(Simulations.schema);

export default Simulations;