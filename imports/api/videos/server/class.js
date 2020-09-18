import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { closeSync, mkdirSync, openSync, rmdirSync, statSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';
import waitOn from 'wait-on';

import FramesImages from '../../framesImages/server/class.js';
import Sceneries from '../../sceneries/both/class.js';
import Simulations from '../../simulations/both/class.js';
import VideosBoth from '../both/class.js';

export default class Videos extends VideosBoth {
    static render(userId, sceneryId, settings) {
        const scenery = Sceneries.findOne(sceneryId);
        const simulationId = scenery.owner;

        const simulation = Simulations.findOne(simulationId);

        const videoId = Random.id();

        const videoFilePath = Meteor.settings.storagePath + "/" + videoId + ".mpeg";

        const opts = {
            fileId: videoId,
            fileName: simulation.name + '.mpeg',
            userId: userId,
            type: 'video/mpeg4',
            size: 0,
            meta: {
                owner: sceneryId,
                state: 'rendering'
            }
        };

        // Create empty file.
        closeSync(openSync(videoFilePath, 'w'));

        VideosBoth.addFile(videoFilePath, opts);

        const imagesPath = Meteor.settings.ramdiskPath + "/" + sceneryId + "_" + Random.id(6);

        mkdirSync(imagesPath);
        FramesImages.renderAll(sceneryId, settings.dimensions, true, imagesPath, settings.initialFrame, settings.finalFrame);

        const command = "ffmpeg";
        const args = [];

        // Input fps.
        args.push("-r");
        args.push(settings.frameRate);

        // Input images dir.
        args.push("-i");
        args.push(imagesPath + "/" + "%d.png");

        // Codec
        args.push("-c:v");
        args.push("libx265");

        // Equivalent to bitrate quality.
        args.push("-crf");
        args.push("28");

        // Compression efficiency.
        args.push("-preset");
        args.push("medium");

        // Output fps.
        args.push("-r");
        args.push("30");

        args.push("-y");

        // Output file path.
        args.push(videoFilePath);

        VideosBoth.setState(videoId, 'encoding');

        execFileSync(command, args);

        rmdirSync(imagesPath, {recursive: true});

        waitOn({resources: [videoFilePath]});

        const stats = statSync(videoFilePath);

        VideosBoth.update(
            videoId,
            {
                $set: {
                    size: stats.size,
                    'meta.state': 'done'
                },
            },
            {
                validate: false
            }
        );
    }

    static remove(videoId) {
        const file = VideosBoth.findOne(videoId);

        if (file.meta.state !== 'done')
            throw {message: "Only videos in 'done' state can be removed."};

        unlinkSync(file.path);

        VideosBoth.remove(videoId);
    }
}