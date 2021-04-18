import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Sceneries = new Mongo.Collection('sceneries');

Sceneries.schema = new SimpleSchema({
    owner: {
        type: String,
        label: "Simulation owner",
        optional: false
    },
    storage: {
        type: String,
        defaultValue: 'local',
        allowedValues: ["local", "s3"]
    },
    gravity: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'gravity.$': {
        type: Number,
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

Sceneries.schema.addValidator(function () {
    const userId = this.userId;

    if (!userId)
        return 'notAuthorized';
});

Sceneries.schema.messageBox.messages({
    'en': {
        'notAuthorized': "User not logged in",
        'notOwner': "The user is not the simulation's owner"
    }
});

Sceneries.attachSchema(Sceneries.schema);

export default Sceneries;