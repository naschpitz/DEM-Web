import { Meteor } from 'meteor/meteor';
import { Random } from 'meteor/random';

import { closeSync, mkdirSync, openSync, rmdirSync, statSync, unlink } from 'fs';
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

        const videoFilePath = Meteor.settings.storagePath + "/" + videoId + ".mp4";

        const opts = {
            fileId: videoId,
            fileName: simulation.name + '.mp4',
            userId: userId,
            type: 'video/mp4',
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

        try {
            FramesImages.renderAll(sceneryId, settings.dimensions, true, imagesPath, settings.initialFrame, settings.finalFrame);
        }

        catch (error) {
            rmdirSync(imagesPath, {recursive: true});
            VideosBoth.setState(videoId, 'errorRendering');
            return;
        }

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
        args.push("24");

        // Compression efficiency.
        args.push("-preset");
        args.push("veryfast");

        // Output fps.
        args.push("-r");
        args.push("30");

        args.push("-y");

        // Output file path.
        args.push(videoFilePath);

        VideosBoth.setState(videoId, 'encoding');

        try {
            execFileSync(command, args);
        }

        catch (error) {
            VideosBoth.setState(videoId, 'errorEncoding');
            return;
        }

        finally {
            rmdirSync(imagesPath, {recursive: true});
        }

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

        if (file.meta.state === 'rendering' || file.meta.state === 'encoding')
            throw {message: "Videos in 'rendering' or 'encoding' states cannot be removed."};

        unlink(file.path, (error) => { /* Do nothing */});

        VideosBoth.remove(videoId);
    }
}