import _ from "lodash"

import CameraFiltersDAO from "./dao.js"

export default class CameraFilters extends CameraFiltersDAO {
  static clone(oldSceneryId, newSceneryId) {
    const oldCameraFilter = CameraFiltersDAO.findOne({ owner: oldSceneryId })

    const newCameraFilter = _.clone(oldCameraFilter)
    delete newCameraFilter._id
    newCameraFilter.owner = newSceneryId

    const newCameraFilterId = CameraFilterDAO.insert(newCameraFilter)

    return newCameraFilterId
  }

  static removeByOwner(sceneryId) {
    CameraFiltersDAO.remove({ owner: sceneryId })
  }
}