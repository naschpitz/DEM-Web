import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

import Dimensions from './schemas/dimensions.js';

const FramesImages = new Mongo.Collection('framesImages');

FramesImages.schema = new SimpleSchema({
    owner: {
        type: String,
        label: "Frame owner",
        optional: false
    },
    state: {
        type: String,
        label: "State",
        allowedValues: ['new', 'gatheringData', 'rendering', 'done'],
        defaultValue: 'new',
        optional: false
    },
    dimensions: {
        type: Dimensions,
        label: "Dimensions",
        optional: false
    },
    data: {
        type: String,
        label: "Data",
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

FramesImages.attachSchema(FramesImages.schema);

export default FramesImages;