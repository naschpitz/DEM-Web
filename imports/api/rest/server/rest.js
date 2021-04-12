import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import * as zlib from 'zlib';

import connectRoute from 'connect-route'

import Frames from '../../frames/server/class.js';
import Simulations from '../../simulations/server/class.js';
import SimulationsLogs from '../../simulationsLogs/both/class.js';

WebApp.connectHandlers.use(connectRoute(function (router) {
    router.post('/api/frames', function (req, res, next) {
        let body = [];

        req.on('data', (chunk) => (body.push(chunk)));
        req.on('end', Meteor.bindEnvironment(() => {
            const compressedData = Buffer.concat(body);

            const inflateCallback = Meteor.bindEnvironment((error, data) => {
                const frame = EJSON.parse(data.toString());

                Frames.insert(frame);
            });

            zlib.inflate(compressedData, inflateCallback);

            res.end("OK");
        }));
        req.on('error', (error) => {
            res.writeHead(400, "Error receiving frame");
            res.end();
        });
    });
}));

WebApp.connectHandlers.use(connectRoute(function (router) {
    router.post('/api/simulationsLogs', function (req, res, next) {
        let body = [];

        req.on('data', (chunk) => (body.push(chunk)));
        req.on('end', Meteor.bindEnvironment(() => {
            const compressedData = Buffer.concat(body);

            const inflateCallback = Meteor.bindEnvironment((error, data) => {
                const simulationLog = EJSON.parse(data.toString());

                Simulations.setState(simulationLog.owner, simulationLog.state);
                SimulationsLogs.insert(simulationLog);
            });

            zlib.inflate(compressedData, inflateCallback);

            res.end("OK");
        }));
        req.on('error', (error) => {
            res.writeHead(400, "Error receiving log");
            res.end();
        });
    });
}));