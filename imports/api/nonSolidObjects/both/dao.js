import dot from "dot-object"
import _ from "lodash"

import NonSolidObjectsCol from "./collection.js"
import createDAO from "../../baseDAO/createDAO";

export default class NonSolidObjectsDAO extends createDAO(NonSolidObjectsCol) {
  static updateObj(nonSolidObject) {
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

    NonSolidObjectsCol.update(dottedNonSolidObject._id, {
      $set: set,
      $unset: unset,
    })
  }
}
