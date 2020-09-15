import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import { Random } from 'meteor/random';
import zlib from 'zlib';
import _ from 'lodash';

import {unlinkSync, writeFileSync, readFileSync, readdirSync} from 'fs';

import FramesBoth from '../both/class.js';
import FramesImages from '../../framesImages/both/class.js';
import Simulations from '../../simulations/both/class.js';

export default class Frames extends FramesBoth {
    static insert(frame) {
        const simulation = Simulations.findOne(frame.owner);
        const state = simulation.state;

        // Refuses the frame if the simulation has been stopped or is new.
        if (state === 'stopped')
            return;

        // The frame._id is created before the insertion because the files need it in their filenames.
        // I could insert the frame before and use the returned id, but some kind of control would be necessary to
        // avoid frames being used before all it's files have been created, while still incomplete.
        frame._id = Random.id();
        const scenery = frame.scenery;

        const nonSolidObjects = _.get(scenery, 'objects.nonSolidObjects', []);
        const solidObjects = _.get(scenery, 'objects.solidObjects', []);

        nonSolidObjects.forEach((nonSolidObject) => {
            const particles = nonSolidObject.particles;
            const data = EJSON.stringify(particles);
            const compressedData = zlib.deflateSync(data.toString(), {level: 9});

            const fileName = Meteor.settings.storagePath + "/" + frame.owner + "-" + frame._id + "-" + nonSolidObject._id;

            writeFileSync(fileName, compressedData);
        });

        solidObjects.forEach((solidObject) => {
            const faces = solidObject.faces;
            const data = EJSON.stringify(faces);
            const compressedData = zlib.deflateSync(data.toString(), {level: 9});

            const fileName = Meteor.settings.storagePath + "/" + frame.owner + "-" + frame._id + "-" + solidObject._id;

            writeFileSync(fileName, compressedData);
        });

        FramesBoth.insert(frame);
    }

    static getFullFrame(frameId) {
        const frame = FramesBoth.findOne(frameId);
        const scenery = frame.scenery;

        const nonSolidObjects = _.get(scenery, 'objects.nonSolidObjects', []);
        const solidObjects = _.get(scenery, 'objects.solidObjects', []);

        nonSolidObjects.forEach((nonSolidObject) => {
            const fileName = Meteor.settings.storagePath + "/" + frame.owner + "-" + frameId + "-" + nonSolidObject._id;

            const compressedData = readFileSync(fileName);
            const data = zlib.inflateSync(compressedData);

            nonSolidObject.particles = EJSON.parse(data.toString());
        });

        solidObjects.forEach((solidObject) => {
            const fileName = Meteor.settings.storagePath + "/" + frame.owner + "-" + frameId + "-" + solidObject._id;

            const compressedData = readFileSync(fileName);
            const data = zlib.inflateSync(compressedData);

            solidObject.faces = EJSON.parse(data.toString());
        });

        return frame;
    }

    static removeByOwner(simulationId) {
        const framesIds = FramesBoth.find({owner: simulationId}).map((frame) => (frame._id));
        FramesImages.remove({owner: {$in: framesIds}});

        // For the same reason of the insertion, but in an opposite order, frames must be removed before it's file, thus
        // avoiding them to be used in an incomplete state.
        FramesBoth.remove({owner: simulationId});

        if (Meteor.isServer) {
            const files = readdirSync(Meteor.settings.storagePath);

            files.forEach((file) => {
                const expression = simulationId + "*";
                const regex = new RegExp(expression, 'i');

                const match = file.match(regex);

                if (match !== null)
                    unlinkSync(Meteor.settings.storagePath + "/" + file);
            });
        }
    }
}