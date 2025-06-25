import dot from "dot-object"
import _ from "lodash"

import getArraysPaths from "../../utils/getArrayPaths"

import SolidObjectsCol from "./collection.js"
import createDAO from "../../baseDAO/createDAO.js"

export default class SolidObjectsDAO extends createDAO(SolidObjectsCol) {
  static async updateObjAsync(solidObject) {
    const dottedSolidObject = dot.dot(solidObject)
    const arraysPaths = getArraysPaths(solidObject)

    const set = {}
    const unset = {}

    _.keys(dottedSolidObject).forEach(key => {
      if (_.find(arraysPaths, arrayPath => key.includes(arrayPath))) return

      const value = dottedSolidObject[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    arraysPaths.forEach(key => {
      const value = _.get(solidObject, key)
      !_.isEmpty(value) ? (set[key] = value) : (unset[key] = "")
    })

    await SolidObjectsCol.updateAsync(dottedSolidObject._id, {
      $set: set,
      $unset: unset,
    })
  }
}
