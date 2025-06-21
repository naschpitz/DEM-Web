import _ from "lodash"

import ObjectsProperties from "../../objectsProperties/both/class.js"
import SolidObjectsDAO from "./dao.js"
import Sceneries from "../../sceneries/both/class"
import Parameters from "../../parameters/both/class"

export default class SolidObjects extends SolidObjectsDAO {
  static async clone(oldSceneryId, newSceneryId, materialsMap) {
    const oldSolidObjects = await SolidObjectsDAO.find({ owner: oldSceneryId }).fetchAsync()

    const solidObjectsMap = {}

    for (const oldSolidObject of oldSolidObjects) {
      const newSolidObject = _.cloneDeep(oldSolidObject)
      delete newSolidObject._id

      newSolidObject.owner = newSceneryId
      newSolidObject.material = materialsMap[oldSolidObject.material]

      const oldSolidObjectId = oldSolidObject._id
      const newSolidObjectId = await SolidObjectsDAO.insertAsync(newSolidObject)

      await ObjectsProperties.clone(oldSolidObjectId, newSolidObjectId)

      solidObjectsMap[oldSolidObjectId] = newSolidObjectId
    }

    return solidObjectsMap
  }

  static async create(sceneryId) {
    const solidObjectId = await SolidObjectsDAO.insertAsync({ owner: sceneryId })
    await ObjectsProperties.create(solidObjectId)

    return solidObjectId
  }

  static async removeAsync(solidObjectId) {
    const parameterResult = await Parameters.usesMaterialObject(solidObjectId)
    if (parameterResult) throw { message: "Cannot remove solid object, a Parameter makes reference to it." }

    const promises = []
    promises.push(SolidObjectsDAO.removeAsync(solidObjectId))
    promises.push(ObjectsProperties.removeByOwner(solidObjectId))

    await Promise.all(promises)
  }

  static async removeByOwner(sceneryId) {
    const solidObjects = SolidObjectsDAO.find({ owner: sceneryId })

    const promises = await solidObjects.mapAsync(async (solidObject) => {
      await ObjectsProperties.removeByOwner(solidObject._id)
    })

    await Promise.all(promises)
    await SolidObjectsDAO.removeAsync({ owner: sceneryId })
  }

  static async usesMaterial(materialId) {
    const materialFound = await SolidObjects.findOneAsync({ material: materialId })

    return !!materialFound
  }

  static async getByCalibration(calibrationId) {
    const scenery = await Sceneries.findByCalibration(calibrationId)
    if (!scenery) throw { code: "404", message: "Scenery not found" }

    const sceneryId = scenery._id
    return await SolidObjects.find({ owner: sceneryId }).fetchAsync()
  }
}
