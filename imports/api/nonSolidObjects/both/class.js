import _ from "lodash"

import NonSolidObjectsDAO from "./dao"
import ObjectsProperties from "../../objectsProperties/both/class"
import Parameters from "../../parameters/both/class"
import Sceneries from "../../sceneries/both/class"

export default class NonSolidObjects extends NonSolidObjectsDAO {
  static async clone(oldSceneryId, newSceneryId, materialsMap) {
    const oldNonSolidObjects = NonSolidObjects.find({ owner: oldSceneryId }).fetchAsync()

    const nonSolidObjectsMap = {}

    for (const oldNonSolidObject of oldNonSolidObjects) {
      const newNonSolidObject = _.cloneDeep(oldNonSolidObject)
      delete newNonSolidObject._id

      newNonSolidObject.owner = newSceneryId
      newNonSolidObject.material = materialsMap[oldNonSolidObject.material]

      const oldNonSolidObjectId = oldNonSolidObject._id
      const newNonSolidObjectId = await NonSolidObjectsDAO.insertAsync(newNonSolidObject)

      await ObjectsProperties.clone(oldNonSolidObjectId, newNonSolidObjectId)

      nonSolidObjectsMap[oldNonSolidObjectId] = newNonSolidObjectId
    }

    return nonSolidObjectsMap
  }

  static async create(sceneryId) {
    const nonSolidObjectId = await NonSolidObjectsDAO.insertAsync({ owner: sceneryId })
    await ObjectsProperties.create(nonSolidObjectId)

    return nonSolidObjectId
  }

  static async removeAsync(nonSolidObjectId) {
    const parameterResult = await Parameters.usesMaterialObject(nonSolidObjectId)
    if (parameterResult) throw { message: "Cannot remove non-solid object, a Parameter makes reference to it." }

    await NonSolidObjectsDAO.removeAsync(nonSolidObjectId)
    await ObjectsProperties.removeByOwner(nonSolidObjectId)
  }

  static async removeByOwner(sceneryId) {
    const nonSolidObjects = NonSolidObjects.find({ owner: sceneryId })

    nonSolidObjects.forEach(nonSolidObject => {
      ObjectsProperties.removeByOwner(nonSolidObject._id)
    })

    await NonSolidObjectsDAO.removeAsync({ owner: sceneryId })
  }

  static async usesMaterial(materialId) {
    const materialFound = await NonSolidObjects.findOneAsync({ material: materialId })

    return !!materialFound
  }

  static async getByCalibration(calibrationId) {
    const scenery = await Sceneries.findByCalibration(calibrationId)
    if (!scenery) throw { code: "404", message: "Scenery not found" }

    const sceneryId = scenery._id
    return await NonSolidObjects.find({ owner: sceneryId }).fetchAsync()
  }
}
