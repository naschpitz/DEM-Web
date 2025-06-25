import dot from "dot-object"
import _ from "lodash"

import getArraysPaths from "../../utils/getArrayPaths"

import CamerasCol from "./collection.js"
import createDAO from "../../baseDAO/createDAO"

export default class CamerasDAO extends createDAO(CamerasCol) {
  static async updateObjAsync(camera) {
    const dottedCamera = dot.dot(camera)
    const arraysPaths = getArraysPaths(camera)

    const set = {}
    const unset = {}

    _.keys(dottedCamera).forEach(key => {
      if (_.find(arraysPaths, arrayPath => key.includes(arrayPath))) return

      const value = dottedCamera[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    arraysPaths.forEach(key => {
      const value = _.get(camera, key)
      !_.isEmpty(value) ? (set[key] = value) : (unset[key] = "")
    })

    await CamerasCol.updateAsync(dottedCamera._id, {
      $set: set,
      $unset: unset,
    })
  }
}
