import _ from "lodash"

import CameraFiltersDAO from "./dao.js"

export default class CameraFilters extends CameraFiltersDAO {
  static clone(oldSceneryId, newSceneryId) {
    const oldCameraFilter = CameraFiltersDAO.findOne({ owner: oldSceneryId })

    const newCameraFilter = _.clone(oldCameraFilter)
    delete newCameraFilter._id
    newCameraFilter.owner = newSceneryId

    const newCameraFilterId = CameraFiltersDAO.insert(newCameraFilter)

    return newCameraFilterId
  }

  static create(sceneryId) {
    return CameraFiltersDAO.insert({ owner: sceneryId })
  }

  static removeByOwner(sceneryId) {
    CameraFiltersDAO.remove({ owner: sceneryId })
  }

  static isWithinLimits(vertices, cameraFilters) {
    return vertices.every((vertex) => {
      const x = vertex[0]
      const y = vertex[1]
      const z = vertex[2]

      return cameraFilters.every((cameraFilter) => {
        let { axis, min, max } = cameraFilter

        min = min !== undefined ? min : -Infinity
        max = max !== undefined ? max : Infinity

        let resultX = true
        let resultY = true
        let resultZ = true

        switch (axis) {
          case "x":
            resultX |= x >= min && y <= max
            break
          case "y":
            resultY |= y >= min && y <= max
            break
          case "z":
            resultZ |= z >= min && z <= max
            break
        }

        return resultX && resultY && resultZ
      })
    })
  }
}