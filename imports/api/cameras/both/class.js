import _ from "lodash"

import CamerasDAO from "./dao.js"

export default class Cameras extends CamerasDAO {
  static async clone(oldSceneryId, newSceneryId) {
    const oldCamera = await CamerasDAO.findOneAsync({ owner: oldSceneryId })

    const newCamera = _.clone(oldCamera)
    delete newCamera._id
    newCamera.owner = newSceneryId

    const newCameraId = await CamerasDAO.insertAsync(newCamera)

    return newCameraId
  }

  static async create(sceneryId) {
    return await CamerasDAO.insertAsync({ owner: sceneryId })
  }

  static async removeByOwner(sceneryId) {
    await CamerasDAO.removeAsync({ owner: sceneryId })
  }
}
