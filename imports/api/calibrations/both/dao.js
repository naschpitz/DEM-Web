import dot from "dot-object"
import _ from "lodash"

import CalibrationsCol from "./collection.js"

export default class CalibrationsDAO {
  static find(...args) {
    return CalibrationsCol.find(...args)
  }

  static findOne(...args) {
    return CalibrationsCol.findOne(...args)
  }

  static insert(...args) {
    return CalibrationsCol.insert(...args)
  }

  static update(...args) {
    return CalibrationsCol.update(...args)
  }

  static upsert(...args) {
    return CalibrationsCol.upsert(...args)
  }

  static remove(...args) {
    return CalibrationsCol.remove(...args)
  }

  static updateObj(calibration) {
    const dottedCalibration = dot.dot(calibration)

    const set = {}
    const unset = {}

    _.keys(dottedCalibration).forEach(key => {
      const value = dottedCalibration[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    CalibrationsCol.update(calibration._id, {
      $set: set,
      $unset: unset,
    })
  }
}
