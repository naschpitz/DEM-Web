import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";

import { closeSync, mkdirSync, openSync, rmdirSync, statSync, unlink } from "fs";
import { spawn } from "child_process"
import waitOn from "wait-on";

import FramesImages from "../../framesImages/server/class.js";
import Sceneries from "../../sceneries/both/class.js";
import Simulations from "../../simulations/both/class.js";
import VideosBoth from "../both/class.js";

export default class Videos extends VideosBoth {
  static async render(userId, sceneryId, settings) {
    const scenery = await Sceneries.findOneAsync(sceneryId);
    const simulationId = scenery.owner;

    const simulation = await Simulations.findOneAsync(simulationId);

    const videoId = Random.id();

    const videoFilePath = Meteor.settings.s3Path + "/" + videoId + ".mp4";

    const opts = {
      fileId: videoId,
      fileName: simulation.name + ".mp4",
      userId: userId,
      type: "video/mp4",
      size: 0,
      meta: {
        owner: sceneryId,
        state: "rendering"
      }
    };

    // Create empty file.
    closeSync(openSync(videoFilePath, "w"));

    await VideosBoth.addFile(videoFilePath, opts);

    const imagesPath = Meteor.settings.tmpPath + "/" + sceneryId + "_" + Random.id(6);

    mkdirSync(imagesPath);

    try {
      await FramesImages.renderAll(sceneryId, settings.dimensions, true, imagesPath, settings.initialFrame, settings.finalFrame);
    } catch (error) {
      console.log("Error rendering images: ", error);
      rmdirSync(imagesPath, { recursive: true });
      await VideosBoth.setState(videoId, "errorRendering", error);
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

    await VideosBoth.setState(videoId, "encoding");

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
      await VideosBoth.setState(videoId, "errorEncoding", error);
      return;
    } finally {
      rmdirSync(imagesPath, { recursive: true });
    }

    waitOn({ resources: [videoFilePath] });

    const stats = statSync(videoFilePath);

    await VideosBoth.updateAsync(
      videoId,
      {
        $set: {
          size: stats.size,
          "meta.state": "done"
        }
      },
      {
        validate: false
      }
    );
  }

  static async removeAsync(videoId) {
    const file = await VideosBoth.findOneAsync(videoId);

    if (file.meta.state === "rendering" || file.meta.state === "encoding")
      throw { message: "Videos in 'rendering' or 'encoding' states cannot be removed." };

    unlink(file.path, (error) => { /* Do nothing */
    });

    await VideosBoth.removeAsync(videoId);
  }
}
