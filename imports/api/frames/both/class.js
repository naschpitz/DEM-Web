import _ from "lodash"

import FramesDAO from "./dao.js"

export default class Frames extends FramesDAO {
  static getData(sceneryId, objectId, dataName, minInterval, maxInterval) {
    const filter = []

    if (minInterval) filter.push({ time: { $gte: minInterval } })
    if (maxInterval) filter.push({ time: { $lte: maxInterval } })

    const selector = {
      owner: sceneryId,
      $or: [{ "scenery.objects.nonSolidObjects._id": objectId }, { "scenery.objects.solidObjects._id": objectId }],
    }

    if (minInterval || maxInterval) selector.$and = filter

    const frames = FramesDAO.find(selector).fetch()

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

    const energies = objects.map(object => object.kineticEnergyTotal)

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
