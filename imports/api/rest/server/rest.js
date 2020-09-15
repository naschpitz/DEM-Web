import { Meteor } from 'meteor/meteor';
import { EJSON } from 'meteor/ejson';
import connectRoute from 'connect-route'
import zlib from 'zlib';

import Frames from '../../frames/server/class.js';
import Simulations from '../../simulations/server/class.js';
import SimulationsLogs from '../../simulationsLogs/both/class.js';

WebApp.connectHandlers.use(connectRoute(function (router) {
    router.post('/api/frames', function (req, res, next) {
        let body = [];

        req.on('data', (chunk) => body.push(chunk));
        req.on('end', Meteor.bindEnvironment(() => {
            const compressedData = Buffer.concat(body);
            const data = zlib.inflateSync(compressedData);

            const frame = EJSON.parse(data.toString());

            Frames.insert(frame);

            res.end("OK");
        }));
    });
}));

WebApp.connectHandlers.use(connectRoute(function (router) {
    router.post('/api/simulationsLogs', function (req, res, next) {
        let body = [];

        req.on('data', (chunk) => body.push(chunk));
        req.on('end', Meteor.bindEnvironment(() => {
            const compressedData = Buffer.concat(body);
            const data = zlib.inflateSync(compressedData);

            const simulationLog = EJSON.parse(data.toString());

            Simulations.setState(simulationLog.owner, simulationLog.state);
            SimulationsLogs.insert(simulationLog);

            res.end("OK");
        }));
    });
}));