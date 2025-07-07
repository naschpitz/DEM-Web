import dot from "dot-object"
import _ from "lodash"

import getArraysPaths from "../../utils/getArrayPaths"

import NonSolidObjectsCol from "./collection"
import createDAO from "../../baseDAO/createDAO"

export default class NonSolidObjectsDAO extends createDAO(NonSolidObjectsCol) {
  static async updateObjAsync(nonSolidObject) {
    const dottedNonSolidObject = dot.dot(nonSolidObject)
    const arraysPaths = getArraysPaths(nonSolidObject)

    const set = {}
    const unset = {}

    _.keys(dottedNonSolidObject).forEach(key => {
      if (_.find(arraysPaths, arrayPath => key.includes(arrayPath))) return

      const value = dottedNonSolidObject[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    arraysPaths.forEach(key => {
      const value = _.get(nonSolidObject, key)
      !_.isEmpty(value) ? (set[key] = value) : (unset[key] = "")
    })

    await NonSolidObjectsCol.updateAsync(dottedNonSolidObject._id, {
      $set: set,
      $unset: unset,
    })
  }
}
