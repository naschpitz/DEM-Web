import _ from "lodash"

import CamerasDAO from "./dao.js"

export default class Cameras extends CamerasDAO {
  static clone(oldSceneryId, newSceneryId) {
    const oldCamera = CamerasDAO.findOne({ owner: oldSceneryId })

    const newCamera = _.clone(oldCamera)
    delete newCamera._id
    newCamera.owner = newSceneryId

    CamerasDAO.insert(newCamera)
  }

  static create(sceneryId) {
    return CamerasDAO.insert({ owner: sceneryId })
  }

  static removeByOwner(sceneryId) {
    CamerasDAO.remove({ owner: sceneryId })
  }
}
