import dot from "dot-object"
import _ from "lodash"

import ObjectsPropertiesCol from "./collection.js"

export default class ObjectsPropertiesDAO {
  static find(...args) {
    return ObjectsPropertiesCol.find(...args)
  }

  static findOne(...args) {
    return ObjectsPropertiesCol.findOne(...args)
  }

  static insert(...args) {
    return ObjectsPropertiesCol.insert(...args)
  }

  static update(...args) {
    return ObjectsPropertiesCol.update(...args)
  }

  static upsert(...args) {
    return ObjectsPropertiesCol.upsert(...args)
  }

  static remove(...args) {
    return ObjectsPropertiesCol.remove(...args)
  }

  static updateObj(objectProperty) {
    const dottedObjectProperty = dot.dot(objectProperty)

    const set = {}
    const unset = {}

    _.keys(dottedObjectProperty).forEach(key => {
      const value = dottedObjectProperty[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    ObjectsPropertiesCol.update(dottedObjectProperty._id, {
      $set: set,
      $unset: unset,
    })
  }
}
