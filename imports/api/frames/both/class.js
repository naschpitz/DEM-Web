import _ from "lodash"

import FramesDAO from "./dao"

export default class Frames extends FramesDAO {
  static async clone(oldSceneryId, newSceneryId, nonSolidObjectsMap, solidObjectsMap) {
    const rawCollection = FramesDAO.rawCollection()
    const cursor = rawCollection.find({ owner: oldSceneryId })

    const batchSize = 1000
    let batch = []

    while (await cursor.hasNext()) {
      const frame = await cursor.next()
      const { _id, ...rest } = frame

      // Update the owner
      rest.owner = newSceneryId

      // Update object IDs
      const nonSolidObjects = rest.scenery?.objects?.nonSolidObjects ?? []
      nonSolidObjects.forEach(nonSolidObject => {
        nonSolidObject._id = nonSolidObjectsMap[nonSolidObject._id]
      })

      const solidObjects = rest.scenery?.objects?.solidObjects ?? []
      solidObjects.forEach(solidObject => {
        solidObject._id = solidObjectsMap[solidObject._id]
      })

      batch.push(rest)

      if (batch.length === batchSize) {
        await rawCollection.insertMany(batch, { ordered: false })
        batch = []
      }
    }

    if (batch.length > 0) {
      await rawCollection.insertMany(batch, { ordered: false })
    }
  }

  static async getData(sceneryId, objectId, dataName, minInterval, maxInterval) {
    const filter = []

    if (minInterval) filter.push({ time: { $gte: minInterval } })
    if (maxInterval) filter.push({ time: { $lte: maxInterval } })

    const selector = {
      owner: sceneryId,
      $or: [{ "scenery.objects.nonSolidObjects._id": objectId }, { "scenery.objects.solidObjects._id": objectId }],
    }

    if (minInterval || maxInterval) selector.$and = filter

    const frames = await FramesDAO.find(selector, { sort: { step: 1 } }).fetchAsync()

    let data = ""

    frames.forEach(frame => {
      const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", null)
      const nonSolidObject = nonSolidObjects.find(nonSolidObject => nonSolidObject._id === objectId)

      const solidObjects = _.get(frame, "scenery.objects.solidObjects", null)
      const solidObject = solidObjects.find(solidObject => solidObject._id === objectId)

      const object = nonSolidObject || solidObject

      data += frame.time + "\t" + _.get(object, dataName) + "\n"
    })

    return data
  }

  static getHighestEnergy(frame) {
    const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", [])
    const solidObjects = _.get(frame, "scenery.objects.solidObjects", [])

    const objects = nonSolidObjects.concat(solidObjects)

    const energies = objects.map(object => object.kineticEnergyTotal).filter(energy => energy != null)

    return Math.max(...energies)
  }

  static hasInvalidData(frame) {
    const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", [])
    const solidObjects = _.get(frame, "scenery.objects.solidObjects", [])

    const objects = nonSolidObjects.concat(solidObjects)

    return objects.some(object => {
      const invalidPosition = object.position.some(position => position == null || isNaN(position))
      const invalidVelocity = object.velocity.some(velocity => velocity == null || isNaN(velocity))
      const invalidForce = object.force.some(force => force == null || isNaN(force))

      return invalidPosition || invalidVelocity || invalidForce
    })
  }
}
