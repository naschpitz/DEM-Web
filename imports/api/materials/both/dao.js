import dot from "dot-object"
import _ from "lodash"

import MaterialsCol from "./collection.js"
import createDAO from "../../baseDAO/createDAO";

export default class MaterialsDAO extends createDAO(MaterialsCol) {
  static updateObj(material) {
    const dottedMaterial = dot.dot(material)
    const arraysPaths = getArraysPaths(material)

    const set = {}
    const unset = {}

    _.keys(dottedMaterial).forEach(key => {
      if (_.find(arraysPaths, arrayPath => key.includes(arrayPath))) return

      const value = dottedMaterial[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    arraysPaths.forEach(key => {
      const value = _.get(material, key)
      !_.isEmpty(value) ? (set[key] = value) : (unset[key] = "")
    })

    MaterialsCol.update(dottedMaterial._id, {
      $set: set,
      $unset: unset,
    })
  }
}
