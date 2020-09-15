import _ from 'lodash';

import Cameras from '../../cameras/both/class.js';
import Frames from '../../frames/server/class.js';
import FramesImagesBoth from '../both/class.js';
import ObjectsProperties from '../../objectsProperties/both/class.js';

import { writeFileSync, readFileSync, unlinkSync } from 'fs';
import { execFileSync } from 'child_process';

export default class FramesImages extends FramesImagesBoth {
    static render(frameId, dimensions) {
        const frame = Frames.findOne(frameId);

        if (!frame)
            return;

        let frameImage = FramesImages.findOne({owner: frameId});

        if (frameImage) {
            const sceneryId = frame.scenery._id;
            const camera = Cameras.findOne({owner: sceneryId});

            let shouldRender = false;
            shouldRender |= isOlder(frameImage, camera);
            shouldRender |= !_.isEqual(frameImage.dimensions, dimensions);

            frameImage.dimensions = dimensions;

            if (shouldRender)
                this.dispatchPovray(frameImage);
        }

        else {
            frameImage = {
                owner: frameId,
                dimensions: dimensions
            };

            const frameImageId = FramesImages.insert(frameImage);

            frameImage = FramesImages.findOne(frameImageId);
            this.dispatchPovray(frameImage);
        }

        function isOlder(obj1, obj2) {
            if (obj1.updatedAt) {
                if (obj2.updatedAt) {
                    if (new Date(obj1.updatedAt) < new Date(obj2.updatedAt)) return true;
                }

                else {
                    if (new Date(obj1.updatedAt) < new Date(obj2.createdAt)) return true;
                }
            }

            else {
                if (obj2.updatedAt) {
                    if (new Date(obj1.createdAt) < new Date(obj2.updatedAt)) return true;
                }

                else {
                    if (new Date(obj1.createdAt) < new Date(obj2.createdAt)) return true;
                }
            }

            return false;
        }
    }

    static dispatchPovray(frameImage) {
        const frameImageId = frameImage._id;
        const frameId = frameImage.owner;
        const dimensions = frameImage.dimensions;

        this.setState(frameImageId, 'gatheringData');

        const frame = Frames.getFullFrame(frameId);
        const scenery = frame.scenery;

        const camera = Cameras.findOne({owner: scenery._id});

        const nonSolidObjects = _.get(scenery, 'objects.nonSolidObjects', []);
        const solidObjects = _.get(scenery, 'objects.solidObjects', []);

        let script = "";

        script += getBackgroudScript() + "\n\n";
        script += getCameraScript(camera) + "\n\n";
        script += getLightScript(camera) + "\n\n";

        nonSolidObjects.forEach(nonSolidObject => (script += getNonSolidObjectScript(nonSolidObject) + "\n\n"));
        solidObjects.forEach(solidObject => (script += getSolidObjectScript(solidObject) + "\n\n"));

        const scriptName = frameId + ".pov";
        writeFileSync(scriptName, script);

        const command = "povray";
        const args = [];
        args.push("+I" + scriptName);
        args.push("+W" + dimensions.width);
        args.push("+H" + dimensions.height);
        args.push("+WT2");
        args.push("-D");

        this.setState(frameImageId, 'rendering');
        execFileSync(command, args);

        const imageName = frameId + ".png";
        const data = readFileSync(imageName);
        frameImage.data = Buffer.from(data, 'binary').toString('base64');

        this.updateObj(frameImage);
        this.setState(frameImageId, 'done');

        unlinkSync(scriptName);
        unlinkSync(imageName);

        function getBackgroudScript() {
            return "background { color rgb <0, 0, 0> }";
        }

        function getCameraScript(camera) {
            const position = _.get(camera, 'position').map(value => (value !== null ? value : 0));
            const lookAt = _.get(camera, 'lookAt').map(value => (value !== null ? value : 0));

            let script = "";
            script += "camera { location <";
            script += position[0] + "," + position[2] + "," + position[1];
            script += "> look_at <";
            script += lookAt[0] + "," + lookAt[2] + "," + lookAt[1];
            script += "> right x*" + dimensions.width/dimensions.height + " }";

            return script;
        }

        function getLightScript(camera) {
            let script = "";
            script += "light_source { <";
            script += camera.position[0] + "," + camera.position[2] + "," + camera.position[1];
            script += "> color rgb <1, 1, 1> }";

            return script;
        }

        function getNonSolidObjectScript(nonSolidObject) {
            let script = "";

            const pigmentScript = getPigmentScript(nonSolidObject._id);

            nonSolidObject.particles.forEach(particle => {
                script += getParticleScript(particle, pigmentScript);
                script += "\n";
            });

            return script;
        }

        function getSolidObjectScript(solidObject) {
            let script = "";

            const pigmentScript = getPigmentScript(solidObject._id);

            solidObject.faces.forEach(face => {
                script += getFaceScript(face, pigmentScript);
                script += "\n";
            });

            return script;
        }

        function getParticleScript(particle, pigmentScript) {
            let script = "";
            script += "sphere { <";
            script += particle.currentPosition[0] + "," + particle.currentPosition[2] + "," + particle.currentPosition[1];
            script += ">, " + particle.radius;
            script += " texture { ";
            script += pigmentScript;
            script += " } }";

            return script;
        }

        function getFaceScript(face, pigmentScript) {
            let script = "";
            script += "triangle { ";

            face.vertexes.forEach((vertex, index) => {
                script += "<" + vertex.currentPosition[0] + "," + vertex.currentPosition[2] + "," + vertex.currentPosition[1] + ">";

                if (index !== 2)
                    script += ",";
            });

            script += " texture { ";
            script += pigmentScript;
            script += " } } ";

            return script;
        }

        function getPigmentScript(objectId) {
            const objectProperty = ObjectsProperties.findOne({owner: objectId});
            const color = objectProperty.color;

            let script = "";
            script += "pigment { color rgbf <";
            script += color.r/255 + "," + color.g/255 + "," + color.b/255 + "," + (1 - color.a);
            script += "> }";

            return script;
        }
    }
}