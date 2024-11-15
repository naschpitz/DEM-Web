import dot from "dot-object"
import _ from "lodash"

import CameraFiltersCol from "./collection.js"

export default class CamerasDAO {
  static find(...args) {
    return CameraFiltersCol.find(...args)
  }

  static findOne(...args) {
    return CameraFiltersCol.findOne(...args)
  }

  static insert(...args) {
    return CameraFiltersCol.insert(...args)
  }

  static update(...args) {
    return CameraFiltersCol.update(...args)
  }

  static upsert(...args) {
    return CameraFiltersCol.upsert(...args)
  }

  static remove(...args) {
    return CameraFiltersCol.remove(...args)
  }

  static updateObj(cameraFilter) {
    const dottedCameraFilter = dot.dot(cameraFilter)

    const set = {}
    const unset = {}

    _.keys(dottedCameraFilter).forEach(key => {
      const value = dottedCameraFilter[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    CameraFiltersCol.update(dottedCameraFilter._id, {
      $set: set,
      $unset: unset,
    })
  }
}
