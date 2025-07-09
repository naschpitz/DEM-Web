import { Meteor } from "meteor/meteor"
import { Random } from "meteor/random"
import _ from "lodash"

import { cpus } from "os"
import { writeFileSync, readFileSync, unlinkSync } from "fs"
import { spawn } from "child_process"

import Cameras from "../../cameras/both/class"
import CameraFilters from "../../cameraFilters/both/class"
import Frames from "../../frames/server/class"
import ObjectsProperties from "../../objectsProperties/both/class"

export default class FramesImages {
  static async render(frameId, dimensions, keepImageFile, path, imageName) {
    const frame = await Frames.getDetailedFrame(frameId)

    // Check if the frame has invalid data
    if (Frames.hasInvalidData(frame)) {
      throw { message: "The frame has invalid data, it won't be rendered" }
    }

    const scenery = frame.scenery

    const camera = await Cameras.findOneAsync({ owner: frame.owner })
    const cameraFilters = await CameraFilters.find({ owner: frame.owner }).fetchAsync()

    const allNonSolidObjects = _.get(scenery, "objects.nonSolidObjects", [])
    const allSolidObjects = _.get(scenery, "objects.solidObjects", [])

    // Filter objects based on display property
    const allObjectIds = [...allNonSolidObjects.map(obj => obj._id), ...allSolidObjects.map(obj => obj._id)]
    const objectsProperties = await ObjectsProperties.find({
      owner: { $in: allObjectIds },
      display: true,
    }).fetchAsync()
    const displayedObjectIds = new Set(objectsProperties.map(prop => prop.owner))

    const nonSolidObjects = allNonSolidObjects.filter(obj => displayedObjectIds.has(obj._id))
    const solidObjects = allSolidObjects.filter(obj => displayedObjectIds.has(obj._id))

    let script = ""

    script += (await getBackgroudScript()) + "\n\n"
    script += (await getCameraScript(camera)) + "\n\n"
    script += (await getLightScript(camera)) + "\n\n"

    for (const nonSolidObject of nonSolidObjects) {
      script += (await getNonSolidObjectScript(nonSolidObject)) + "\n\n"
    }

    for (const solidObject of solidObjects) {
      script += (await getSolidObjectScript(solidObject)) + "\n\n"
    }

    const random = Random.id(6)
    const scriptPath = (path ? path + "/" : Meteor.settings.tmpPath + "/") + frameId + "_" + random + ".pov"
    writeFileSync(scriptPath, script)

    let nCpus = cpus().length
    nCpus = nCpus > 1 ? nCpus - 1 : 1

    const command = "povray"
    const args = []
    args.push("+I" + scriptPath)
    args.push("+W" + dimensions.width)
    args.push("+H" + dimensions.height)
    args.push("+A")
    args.push("+AM2")
    args.push("+R1")
    args.push("+WT" + nCpus)
    args.push("+MI" + 1024)
    args.push("-D")

    return new Promise((resolve, reject) => {
      if (keepImageFile) {
        const imagePath = (path ? path + "/" : "") + (imageName ? imageName : frameId + "_" + Random.id(6) + ".png")
        args.push("+O" + imagePath)

        const porvray = spawn(command, args)

        porvray.stderr.on("data", error => {
          // Do nothing, but still this callback is necessary, otherwise the process will hang.
        })

        porvray.on("error", error => {
          console.error("POV-Ray error:", error)

          cleanUp(scriptPath)
          reject(error)
        })

        porvray.on("close", code => {
          cleanUp(scriptPath)

          if (code !== 0) {
            console.log("ERROR: POV-Ray exited with code " + code)
            return reject(new Error("POV-Ray exited with code " + code))
          }

          try {
            const image = readFileSync(imagePath)
            resolve(Buffer.from(image, "binary").toString("base64"))
          } catch (error) {
            console.log("Error reading image file: ", error)
            reject(error)
          }
        })
      } else {
        args.push("+O-") // output to stdout
        const porvray = spawn(command, args)

        let chunks = []

        porvray.stdout.on("data", chunk => chunks.push(chunk))

        porvray.stderr.on("data", error => {
          // Do nothing, but still this callback is necessary, otherwise the process will hang.
        })

        porvray.on("error", error => {
          console.error("POV-Ray error:", error)

          cleanUp(scriptPath)
          reject(error)
        })

        porvray.on("close", code => {
          cleanUp(scriptPath)

          if (code !== 0) {
            return reject(new Error("POV-Ray exited with code " + code))
          }

          const buffer = Buffer.concat(chunks)
          resolve(buffer.toString("base64"))
        })
      }
    })

    async function getBackgroudScript() {
      return "background { color rgb <0, 0, 0> }"
    }

    async function getCameraScript(camera) {
      const position = _.get(camera, "position").map(value => (value !== null ? value : 0))
      const lookAt = _.get(camera, "lookAt").map(value => (value !== null ? value : 0))

      let script = ""
      script += "camera { location <"
      script += position[0] + "," + position[2] + "," + position[1]
      script += "> look_at <"
      script += lookAt[0] + "," + lookAt[2] + "," + lookAt[1]
      script += "> right x*" + dimensions.width / dimensions.height + " }"

      return script
    }

    async function getLightScript(camera) {
      let script = ""
      script += "light_source { <"
      script += camera.position[0] + "," + camera.position[2] + "," + camera.position[1]
      script += "> color rgb <1, 1, 1> }"

      return script
    }

    async function getNonSolidObjectScript(nonSolidObject) {
      let script = ""

      const pigmentScript = await getPigmentScript(nonSolidObject._id)

      for (const particle of nonSolidObject.particles) {
        // Do not add the particle to the script if it is outside the camera filter
        if (!CameraFilters.isWithinLimits(particle.position, cameraFilters)) continue

        script += await getParticleScript(particle, pigmentScript)
        script += "\n"
      }

      return script
    }

    async function getSolidObjectScript(solidObject) {
      let script = ""

      const pigmentScript = await getPigmentScript(solidObject._id)

      for (const face of solidObject.faces) {
        script += await getFaceScript(face, pigmentScript)
        script += "\n"
      }

      return script
    }

    async function getParticleScript(particle, pigmentScript) {
      let script = ""
      script += "sphere { <"
      script += particle.position[0] + "," + particle.position[2] + "," + particle.position[1]
      script += ">, " + particle.radius
      script += " texture { "
      script += pigmentScript
      script += " } }"

      return script
    }

    async function getFaceScript(face, pigmentScript) {
      let script = ""
      script += "triangle { "

      face.vertexes.forEach((vertex, index) => {
        script += "<" + vertex.position[0] + "," + vertex.position[2] + "," + vertex.position[1] + ">"

        if (index !== 2) script += ","
      })

      script += " texture { "
      script += pigmentScript
      script += " } } "

      return script
    }

    async function getPigmentScript(objectId) {
      const objectProperty = await ObjectsProperties.findOneAsync({ owner: objectId })
      const color = objectProperty.color

      let script = ""
      script += "pigment { color rgbf <"
      script += color.r / 255 + "," + color.g / 255 + "," + color.b / 255 + "," + (1 - color.a)
      script += "> }"

      return script
    }

    function cleanUp(scriptPath) {
      unlinkSync(scriptPath, error => {
        if (error) {
          console.error("Error removing povray script file: ", scriptPath, error)
        }
      })
    }
  }

  static async renderAll(sceneryId, dimensions, keepImageFile, path, initialFrame, finalFrame) {
    const selector = {
      owner: sceneryId,
      detailed: true,
    }

    if (initialFrame || finalFrame) {
      const frames = await Frames.find(selector, { sort: { step: 1 } }).fetchAsync()

      if (initialFrame > finalFrame) throw { message: "Initial frame can't be higher than final frame" }

      if (initialFrame <= 0 || finalFrame <= 0) throw { message: "Frames can't have negative or zero values" }

      if (initialFrame > frames.length || finalFrame > frames.length)
        throw { message: "Frames can't be higher than the total frames count" }

      if (initialFrame === finalFrame) throw { message: "Frames cannot have the same value" }

      if (initialFrame) {
        const frame = frames[initialFrame - 1]

        selector.$and = [{ step: { $gte: frame.step } }]
      }

      if (finalFrame) {
        const frame = frames[finalFrame - 1]

        if (selector.$and) selector.$and.push({ step: { $lte: frame.step } })
        else selector.$and = [{ step: { $lte: frame.step } }]
      }
    }

    const frames = await Frames.find(selector, { sort: { step: 1 } }).fetchAsync()

    const renderSequentially = async frames => {
      const results = []
      let index = 0

      for (const frame of frames) {
        const imageName = index + ".png"
        const result = await this.render(frame._id, dimensions, keepImageFile, path, imageName)
        results.push(result)
        index++
      }

      return results
    }

    return await renderSequentially.call(this, frames)
  }
}
