import _ from "lodash"

import CameraFiltersDAO from "./dao.js"

export default class CameraFilters extends CameraFiltersDAO {
  static async clone(oldSceneryId, newSceneryId) {
    const cameraFilters = await CameraFiltersDAO.find({ owner: oldSceneryId }).fetchAsync()

    for (const cameraFilter of cameraFilters) {
      delete cameraFilter._id
      cameraFilter.owner = newSceneryId

      await CameraFiltersDAO.insertAsync(cameraFilter)
    }
  }

  static async create(sceneryId) {
    return await CameraFiltersDAO.insertAsync({ owner: sceneryId })
  }

  static async removeByOwner(sceneryId) {
    await CameraFiltersDAO.removeAsync({ owner: sceneryId })
  }

  static isWithinLimits(positions, cameraFilters) {
    // If positions is not an array of arrays, make it an array of arrays
    if (!Array.isArray(positions[0])) {
      positions = [positions]
    }

    return positions.every(position => {
      const x = position[0]
      const y = position[1]
      const z = position[2]

      return cameraFilters.every(cameraFilter => {
        let { axis, min, max } = cameraFilter

        min = min !== undefined ? min : -Infinity
        max = max !== undefined ? max : Infinity

        let resultX = true
        let resultY = true
        let resultZ = true

        switch (axis) {
          case "x":
            resultX = x >= min && x <= max
            break
          case "y":
            resultY = y >= min && y <= max
            break
          case "z":
            resultZ = z >= min && z <= max
            break
        }

        return resultX && resultY && resultZ
      })
    })
  }
}
