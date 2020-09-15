import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const SolidObjects = new Mongo.Collection('solidObjects');

SolidObjects.schema = new SimpleSchema({
    owner: {
        type: String,
        label: "Scenery owner",
        regEx: SimpleSchema.RegEx.Id,
        optional: false
    },
    name: {
        type: String,
        label: "Name",
        defaultValue: "New Solid Object",
        optional: true,
    },
    material: {
        type: String,
        label: "Material",
        regEx: SimpleSchema.RegEx.Id,
        optional: true
    },
    stl: {
        type: String,
        label: "STL",
        optional: true
    },
    fixed: {
        type: Boolean,
        label: "Fixed",
        optional: true
    },
    mass: {
        type: Number,
        label: "Mass",
        optional: true,
    },
    position: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'position.$': {
        type: Number,
        },
    velocity: {
        type: Array,
        minCount: 1,
        maxCount: 3,
        defaultValue: [0, 0, 0],
        optional: true
    },
    'velocity.$': {
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

SolidObjects.schema.addValidator(function () {
    const userId = this.userId;

    if (!userId)
        return 'notAuthorized';
});

SolidObjects.schema.messageBox.messages({
    'en': {
        'notAuthorized': "User not logged in",
        'notOwner': "The user is not the simulation's owner"
    }
});

SolidObjects.attachSchema(SolidObjects.schema);

export default SolidObjects;