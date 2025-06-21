import { Meteor } from "meteor/meteor"
import { EJSON } from "meteor/ejson"
import { Random } from "meteor/random"
import _ from "lodash"

import { unlink, unlinkSync, writeFileSync, readFileSync, readdirSync, copyFileSync } from "fs"

import { deflateWithPigz, inflateWithPigz } from "../../utils/pigz";

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

  static async insertAsync(frame) {
    const scenery = await Sceneries.findOneAsync(frame.owner)
    if (!scenery)
      throw { message: "Frames.insertAsync(): scenery not found" }

    const simulation = await Simulations.findOneAsync(scenery.owner)
    if (!simulation)
      throw { message: "Frames.insertAsync(): simulation not found" }

    // Refuses the frame if the simulation has been stopped.
    if (simulation.state === "stopped") return

    // The frame._id is created before the insertion because the files need it in their filenames.
    // I could insert the frame before and use the returned id, but some kind of control would be necessary to
    // avoid frames being used before all it's files have been created, while still incomplete.
    frame._id = Random.id()

    const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", [])
    const solidObjects = _.get(frame, "scenery.objects.solidObjects", [])

    const currentStoragePath = Frames.getStoragePath(scenery.storage)

    for (const nonSolidObject of nonSolidObjects) {
      const particles = nonSolidObject.particles

      // If there are no particles, there is no need to save the file.
      // That means this frame belongs to a simulation that was probably ran during a calibration, which will not
      // contain detailed information about the particles position, velocity, forces, etc.
      if (!particles) continue

      const data = EJSON.stringify(particles)

      try {
        const deflatedData = await deflateWithPigz(data.toString())
        const fileName = currentStoragePath + "/" + frame.owner + "-" + frame._id + "-" + nonSolidObject._id

        writeFileSync(fileName, deflatedData)
      } catch (error) {
        console.log("Error deflating nonSolidObject: ", error)
      }
    }

    for (const solidObject of solidObjects) {
      const faces = solidObject.faces

      // If there are no faces, there is no need to save the file.
      // That means this frame belongs to a simulation that was probably ran during a calibration, which will not
      // contain detailed information about the faces position, velocity, forces, etc.
      if (!faces) continue

      const data = EJSON.stringify(faces)

      try {
        const deflatedData = await deflateWithPigz(data.toString())
        const fileName = currentStoragePath + "/" + frame.owner + "-" + frame._id + "-" + solidObject._id

        writeFileSync(fileName, deflatedData)
      } catch (error) {
        console.log("Error deflating solidObject: ", error)
      }
    }

    FramesBoth.insertAsync(frame)
  }

  static async getFullFrame(frameId) {
    const frame = await FramesBoth.findOneAsync(frameId)

    if (!frame) return

    const scenery = await Sceneries.findOneAsync(frame.owner)

    const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", [])
    const solidObjects = _.get(frame, "scenery.objects.solidObjects", [])

    const currentStoragePath = Frames.getStoragePath(scenery.storage)

    const nonSolidObjectsPromises = nonSolidObjects.map(async (nonSolidObject) => {
      try {
        const fileName = currentStoragePath + "/" + frame.owner + "-" + frameId + "-" + nonSolidObject._id

        const deflatedData = readFileSync(fileName)
        const inflatedData = await inflateWithPigz(deflatedData)

        nonSolidObject.particles = EJSON.parse(inflatedData.toString())
      } catch (error) {
        console.log("Error inflating nonSolidObject: ", error)
      }
    })

    const solidObjectsPromises = solidObjects.map(async (solidObject) => {
      try {
        const fileName = currentStoragePath + "/" + frame.owner + "-" + frameId + "-" + solidObject._id

        const deflatedData = readFileSync(fileName)
        const inflatedData = await inflateWithPigz(deflatedData)

        solidObject.faces = EJSON.parse(inflatedData.toString())
      } catch (error) {
        console.log("Error inflating solidObject: ", error)
      }
    })

    await Promise.all(nonSolidObjectsPromises)
    await Promise.all(solidObjectsPromises)

    return frame
  }

  static async removeByOwner(sceneryId) {
    const scenery = await Sceneries.findOneAsync(sceneryId)
    const currentStoragePath = Frames.getStoragePath(scenery.storage)

    // For the same reason of the insertion, but in an opposite order, frames must be removed before it's file, thus
    // avoiding them to be used in an incomplete state.
    await FramesBoth.removeAsync({ owner: sceneryId })

    const expression = sceneryId + "*"
    const regex = new RegExp(expression, "i")

    const files = []

    readdirSync(currentStoragePath).map(file => {
      const match = file.match(regex)

      if (match !== null) files.push(file)
    })

    files.forEach(file => {
      if (scenery.storage === "s3")
        unlinkSync(currentStoragePath + "/" + file)

      if (scenery.storage === "local")
        unlink(currentStoragePath + "/" + file, error => {
          /* Do nothing */
        })
    })
  }

  static async setStorage(sceneryId, currentStorage, newStorage) {
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

      if (currentStorage === "s3") {
        try {
          unlinkSync(src)
        } catch (error) {
          /* Do nothing */
        }
      }

      else {
        unlink(src, error => {
          /* Do nothing */
        })
      }
    })
  }
}
