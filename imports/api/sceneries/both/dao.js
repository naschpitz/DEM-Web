import dot from "dot-object"
import _ from "lodash"

import getArraysPaths from "../../utils/getArrayPaths"

import SceneriesCol from "./collection.js"
import createDAO from "../../baseDAO/createDAO"

export default class SceneriesDAO extends createDAO(SceneriesCol) {
  static async updateObjAsync(scenery) {
    const dottedScenery = dot.dot(scenery)
    const arraysPaths = getArraysPaths(scenery)

    const set = {}
    const unset = {}

    _.keys(dottedScenery).forEach(key => {
      if (_.find(arraysPaths, arrayPath => key.includes(arrayPath))) return

      const value = dottedScenery[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    arraysPaths.forEach(key => {
      const value = _.get(scenery, key)
      !_.isEmpty(value) ? (set[key] = value) : (unset[key] = "")
    })

    await SceneriesCol.updateAsync(dottedScenery._id, {
      $set: set,
      $unset: unset,
    })
  }
}
