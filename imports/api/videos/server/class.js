import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";

import { closeSync, mkdirSync, openSync, rmdirSync, statSync, unlink } from "fs";
import { spawn } from "child_process"
import waitOn from "wait-on";

import FramesImages from "../../framesImages/server/class.js";
import Sceneries from "../../sceneries/both/class.js";
import Simulations from "../../simulations/both/class.js";
import Files from "../../files/both/class.js";

export default class Videos extends Files {
  static async render(userId, sceneryId, settings) {
    const scenery = await Sceneries.findOneAsync(sceneryId);
    const simulationId = scenery.owner;

    const simulation = await Simulations.findOneAsync(simulationId);

    const fileId = Random.id();

    const filePath = Meteor.settings.s3Path + "/" + fileId + ".mp4";

    // Create empty file.
    closeSync(openSync(filePath, "w"));

    // Create video file document
    const file = {
      _id: fileId,
      name: simulation.name + ".mp4",
      path: filePath,
      size: 0,
      type: "video/mp4",
      isVideo: true,
      isAudio: false,
      isImage: false,
      isText: false,
      isJSON: false,
      isPDF: false,
      owner: sceneryId,
      state: "rendering"
    };

    await Files.insertAsync(file);

    const imagesPath = Meteor.settings.tmpPath + "/" + sceneryId + "_" + Random.id(6);

    mkdirSync(imagesPath);

    try {
      await FramesImages.renderAll(sceneryId, settings.dimensions, true, imagesPath, settings.initialFrame, settings.finalFrame);
    } catch (error) {
      rmdirSync(imagesPath, { recursive: true });
      await Files.setState(fileId, "errorRendering", error);
      throw error;
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
    args.push(filePath);

    await Files.setState(fileId, "encoding");

    try {
      await new Promise((resolve, reject) => {
        const ffmpeg = spawn(command, args);

        ffmpeg.stderr.on("data", data => {
          // Do nothing, but still this callback is necessary, otherwise the process will hang.
        });

        ffmpeg.on("error", error => {
          console.error("ffmpeg error:", error);
          reject(error);
        });

        ffmpeg.on("close", code => {
          if (code !== 0) {
            return reject(new Error(`ffmpeg exited with code ${code}`));
          }
          resolve();
        });
      });
    } catch (error) {
      await Files.setState(fileId, "errorEncoding", error);
      return;
    } finally {
      rmdirSync(imagesPath, { recursive: true });
    }

    waitOn({ resources: [filePath] });

    const stats = statSync(filePath);

    await Files.updateAsync(
      fileId,
      {
        $set: {
          size: stats.size,
          state: "done"
        }
      },
      {
        validate: false
      }
    );
  }

  static async removeAsync(fileId) {
    const file = await Files.findOneAsync(fileId);

    if (file.state === "rendering" || file.state === "encoding")
      throw { message: "Videos in 'rendering' or 'encoding' states cannot be removed." };

    unlink(file.path, (error) => { /* Do nothing */
    });

    await Files.removeAsync(fileId);
  }
}
