import { Meteor } from "meteor/meteor"
import { Random } from "meteor/random"
import _ from "lodash"

import { cpus } from "os"
import { writeFileSync, readFileSync, unlink } from "fs"
import { execFileSync } from "child_process"

import Cameras from "../../cameras/both/class.js"
import Frames from "../../frames/server/class.js"
import ObjectsProperties from "../../objectsProperties/both/class.js"

export default class FramesImages {
  static render(frameId, dimensions, keepImageFile, path, imageName) {
    const frame = Frames.getFullFrame(frameId)

    if (!frame) return

    // Check if the frame has invalid data
    if (Frames.hasInvalidData(frame)) {
      throw { message: "The frame has invalid data, it won't be rendered" }
    }

    const scenery = frame.scenery

    const camera = Cameras.findOne({ owner: frame.owner })

    const nonSolidObjects = _.get(scenery, "objects.nonSolidObjects", [])
    const solidObjects = _.get(scenery, "objects.solidObjects", [])

    let script = ""

    script += getBackgroudScript() + "\n\n"
    script += getCameraScript(camera) + "\n\n"
    script += getLightScript(camera) + "\n\n"

    nonSolidObjects.forEach(nonSolidObject => (script += getNonSolidObjectScript(nonSolidObject) + "\n\n"))
    solidObjects.forEach(solidObject => (script += getSolidObjectScript(solidObject) + "\n\n"))

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

    let data

    try {
      if (keepImageFile) {
        const imagePath = (path ? path + "/" : "") + (imageName ? imageName : frameId + "_" + random + ".png")
        args.push("+O" + imagePath)

        execFileSync(command, args)
        data = readFileSync(imagePath)
      } else {
        args.push("+O-")

        // 10MB of maximum buffer to stdout or stderr.
        data = execFileSync(command, args, { maxBuffer: 10485760 })
      }
    } catch (error) {
      throw error
    } finally {
      unlink(scriptPath, error => {
        /* Do nothing */
      })
    }

    return Buffer.from(data, "binary").toString("base64")

    function getBackgroudScript() {
      return "background { color rgb <0, 0, 0> }"
    }

    function getCameraScript(camera) {
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

    function getLightScript(camera) {
      let script = ""
      script += "light_source { <"
      script += camera.position[0] + "," + camera.position[2] + "," + camera.position[1]
      script += "> color rgb <1, 1, 1> }"

      return script
    }

    function getNonSolidObjectScript(nonSolidObject) {
      let script = ""

      const pigmentScript = getPigmentScript(nonSolidObject._id)

      nonSolidObject.particles.forEach(particle => {
        script += getParticleScript(particle, pigmentScript)
        script += "\n"
      })

      return script
    }

    function getSolidObjectScript(solidObject) {
      let script = ""

      const pigmentScript = getPigmentScript(solidObject._id)

      solidObject.faces.forEach(face => {
        script += getFaceScript(face, pigmentScript)
        script += "\n"
      })

      return script
    }

    function getParticleScript(particle, pigmentScript) {
      let script = ""
      script += "sphere { <"
      script += particle.currentPosition[0] + "," + particle.currentPosition[2] + "," + particle.currentPosition[1]
      script += ">, " + particle.radius
      script += " texture { "
      script += pigmentScript
      script += " } }"

      return script
    }

    function getFaceScript(face, pigmentScript) {
      let script = ""
      script += "triangle { "

      face.vertexes.forEach((vertex, index) => {
        script +=
          "<" + vertex.currentPosition[0] + "," + vertex.currentPosition[2] + "," + vertex.currentPosition[1] + ">"

        if (index !== 2) script += ","
      })

      script += " texture { "
      script += pigmentScript
      script += " } } "

      return script
    }

    function getPigmentScript(objectId) {
      const objectProperty = ObjectsProperties.findOne({ owner: objectId })
      const color = objectProperty.color

      let script = ""
      script += "pigment { color rgbf <"
      script += color.r / 255 + "," + color.g / 255 + "," + color.b / 255 + "," + (1 - color.a)
      script += "> }"

      return script
    }
  }

  static renderAll(sceneryId, dimensions, keepImageFile, path, initialFrame, finalFrame) {
    const selector = {
      owner: sceneryId,
    }

    if (initialFrame || finalFrame) {
      const frames = Frames.find(selector, { sort: { step: 1 } }).fetch()

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

    const frames = Frames.find(selector, { sort: { step: 1 } }).fetch()

    return frames.map((frame, index) => {
      const imageName = index + ".png"

      const data = this.render(frame._id, dimensions, keepImageFile, path, imageName)

      return [frame._id, data]
    })
  }
}
