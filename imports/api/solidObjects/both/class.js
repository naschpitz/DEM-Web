import _ from "lodash"

import ObjectsProperties from "../../objectsProperties/both/class.js"
import SolidObjectsDAO from "./dao.js"
import Sceneries from "../../sceneries/both/class"

export default class SolidObjects extends SolidObjectsDAO {
  static clone(oldSceneryId, newSceneryId, materialsMap) {
    const oldSolidObjects = SolidObjectsDAO.find({ owner: oldSceneryId })

    const solidObjectsMap = {}

    oldSolidObjects.forEach(oldSolidObject => {
      const newSolidObject = _.cloneDeep(oldSolidObject)
      delete newSolidObject._id

      newSolidObject.owner = newSceneryId
      newSolidObject.material = materialsMap.get(oldSolidObject.material)

      const oldSolidObjectId = oldSolidObject._id
      const newSolidObjectId = SolidObjectsDAO.insert(newSolidObject)

      ObjectsProperties.clone(oldSolidObjectId, newSolidObjectId)

      solidObjectsMap[oldSolidObjectId] = newSolidObjectId
    })

    return solidObjectsMap
  }

  static create(sceneryId) {
    const solidObjectId = SolidObjectsDAO.insert({ owner: sceneryId })
    ObjectsProperties.create(solidObjectId)

    return solidObjectId
  }

  static remove(solidObjectId) {
    SolidObjectsDAO.remove(solidObjectId)
    ObjectsProperties.removeByOwner(solidObjectId)
  }

  static removeByOwner(sceneryId) {
    const solidObjects = SolidObjectsDAO.find({ owner: sceneryId })

    solidObjects.forEach(solidObject => {
      ObjectsProperties.removeByOwner(solidObject._id)
    })

    SolidObjectsDAO.remove({ owner: sceneryId })
  }

  static usesMaterial(materialId) {
    const materialFound = SolidObjects.findOne({ material: materialId })

    return !!materialFound
  }

  static getByCalibration(calibrationId) {
    const scenery = Sceneries.findByCalibration(calibrationId)
    if (!scenery) throw { code: "404", message: "Scenery not found" }

    const sceneryId = scenery._id
    return SolidObjects.find({ owner: sceneryId }).fetch()
  }
}
