import { Meteor } from "meteor/meteor"
import { EJSON } from "meteor/ejson"
import { Random } from "meteor/random"
import zlib from "zlib"
import _ from "lodash"

import { unlink, unlinkSync, writeFileSync, readFileSync, readdirSync, copyFileSync } from "fs"

import FramesBoth from "../both/class.js"
import Sceneries from "../../sceneries/both/class.js"
import Simulations from "../../simulations/both/class.js"

export default class Frames extends FramesBoth {
  static getStoragePath(storage) {
    switch (storage) {
      case "local":
        return Meteor.settings.localPath
      case "s3":
        return Meteor.settings.s3Path
    }
  }

  static insert(frame) {
    const scenery = Sceneries.findOne(frame.owner)
    if (!scenery) {
      throw { message: "Frames.insert(): scenery not found" }
      return
    }

    const simulation = Simulations.findOne(scenery.owner)
    if (!simulation) {
      throw { message: "Frames.insert(): simulation not found" }
      return
    }

    const state = simulation.state

    // Refuses the frame if the simulation has been stopped.
    if (state === "stopped") return

    // The frame._id is created before the insertion because the files need it in their filenames.
    // I could insert the frame before and use the returned id, but some kind of control would be necessary to
    // avoid frames being used before all it's files have been created, while still incomplete.
    frame._id = Random.id()

    const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", [])
    const solidObjects = _.get(frame, "scenery.objects.solidObjects", [])

    const currentStoragePath = Frames.getStoragePath(scenery.storage)

    nonSolidObjects.forEach(nonSolidObject => {
      const particles = nonSolidObject.particles

      // If there are no particles, there is no need to save the file.
      // That means this frame belongs to a simulation that was probably ran during a calibration, which will not
      // contain detailed information about the particles position, velocity, forces, etc.
      if (!particles) return

      const data = EJSON.stringify(particles)
      const compressedData = zlib.deflateSync(data.toString(), { level: 9 })

      const fileName = currentStoragePath + "/" + frame.owner + "-" + frame._id + "-" + nonSolidObject._id

      writeFileSync(fileName, compressedData)
    })

    solidObjects.forEach(solidObject => {
      const faces = solidObject.faces

      // If there are no faces, there is no need to save the file.
      // That means this frame belongs to a simulation that was probably ran during a calibration, which will not
      // contain detailed information about the faces position, velocity, forces, etc.
      if (!faces) return

      const data = EJSON.stringify(faces)
      const compressedData = zlib.deflateSync(data.toString(), { level: 9 })

      const fileName = currentStoragePath + "/" + frame.owner + "-" + frame._id + "-" + solidObject._id

      writeFileSync(fileName, compressedData)
    })

    FramesBoth.insert(frame)
  }

  static getFullFrame(frameId) {
    const frame = FramesBoth.findOne(frameId)

    if (!frame) return

    const scenery = Sceneries.findOne(frame.owner)

    const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", [])
    const solidObjects = _.get(frame, "scenery.objects.solidObjects", [])

    const currentStoragePath = Frames.getStoragePath(scenery.storage)

    nonSolidObjects.forEach(nonSolidObject => {
      const fileName = currentStoragePath + "/" + frame.owner + "-" + frameId + "-" + nonSolidObject._id

      const compressedData = readFileSync(fileName)
      const data = zlib.inflateSync(compressedData)

      nonSolidObject.particles = EJSON.parse(data.toString())
    })

    solidObjects.forEach(solidObject => {
      const fileName = currentStoragePath + "/" + frame.owner + "-" + frameId + "-" + solidObject._id

      const compressedData = readFileSync(fileName)
      const data = zlib.inflateSync(compressedData)

      solidObject.faces = EJSON.parse(data.toString())
    })

    return frame
  }

  static removeByOwner(sceneryId) {
    const scenery = Sceneries.findOne(sceneryId)
    const currentStoragePath = Frames.getStoragePath(scenery.storage)

    // For the same reason of the insertion, but in an opposite order, frames must be removed before it's file, thus
    // avoiding them to be used in an incomplete state.
    FramesBoth.remove({ owner: sceneryId })

    const expression = sceneryId + "*"
    const regex = new RegExp(expression, "i")

    const files = []

    readdirSync(currentStoragePath).map(file => {
      const match = file.match(regex)

      if (match !== null) files.push(file)
    })

    files.forEach(file =>
      unlinkSync(currentStoragePath + "/" + file, error => {
        /* Do nothing */
      })
    )
  }

  static setStorage(sceneryId, currentStorage, newStorage) {
    const currentStoragePath = Frames.getStoragePath(currentStorage)
    const newStoragePath = Frames.getStoragePath(newStorage)

    const expression = sceneryId + "*"
    const regex = new RegExp(expression, "i")

    const files = []

    readdirSync(currentStoragePath).forEach(file => {
      const match = file.match(regex)

      if (match !== null) files.push(file)
    })

    files.forEach(file => {
      const src = currentStoragePath + "/" + file
      const dst = newStoragePath + "/" + file

      copyFileSync(src, dst)

      if (currentStorage === "s3")
        unlinkSync(src, error => {
          /* Do nothing */
        })
      else
        unlink(src, error => {
          /* Do nothing */
        })
    })
  }
}
