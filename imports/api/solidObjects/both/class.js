import _ from "lodash"

import ObjectsProperties from "../../objectsProperties/both/class.js"
import SolidObjectsDAO from "./dao.js"

export default class SolidObjects extends SolidObjectsDAO {
  static clone(oldSceneryId, newSceneryId, materialsMap) {
    const oldSolidObjects = SolidObjectsDAO.find({ owner: oldSceneryId })

    oldSolidObjects.forEach(oldSolidObject => {
      const newSolidObject = _.cloneDeep(oldSolidObject)
      delete newSolidObject._id
      newSolidObject.owner = newSceneryId
      newSolidObject.material = materialsMap.get(oldSolidObject.material)

      const oldNonSolidObjectId = oldSolidObject._id
      const newNonSolidObjectId = SolidObjectsDAO.insert(newSolidObject)

      ObjectsProperties.clone(oldNonSolidObjectId, newNonSolidObjectId)
    })
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
}
