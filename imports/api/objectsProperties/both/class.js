import _ from "lodash"

import ObjectsPropertiesDAO from "./dao"

export default class ObjectsProperties extends ObjectsPropertiesDAO {
  static async clone(oldObjectId, newObjectId) {
    const oldObjectProperty = await ObjectsPropertiesDAO.findOneAsync({ owner: oldObjectId })

    const newObjectProperty = _.clone(oldObjectProperty)
    delete newObjectProperty._id
    newObjectProperty.owner = newObjectId

    const newObjectPropertyId = await ObjectsPropertiesDAO.insertAsync(newObjectProperty)

    return newObjectPropertyId
  }

  static async create(objectId) {
    await ObjectsPropertiesDAO.insertAsync({ owner: objectId })
  }

  static async removeByOwner(objectId) {
    await ObjectsPropertiesDAO.removeAsync({ owner: objectId })
  }
}
