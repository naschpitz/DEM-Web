import dot from "dot-object"
import _ from "lodash"

import DataSetsCol from "./collection.js"

export default class DataSetsDAO {
  static find(...args) {
    return DataSetsCol.find(...args)
  }

  static findOne(...args) {
    return DataSetsCol.findOne(...args)
  }

  static insert(...args) {
    return DataSetsCol.insert(...args)
  }

  static update(...args) {
    return DataSetsCol.update(...args)
  }

  static upsert(...args) {
    return DataSetsCol.upsert(...args)
  }

  static remove(...args) {
    return DataSetsCol.remove(...args)
  }

  static updateObj(dataSet) {
    const dottedDataSet = dot.dot(dataSet)

    const set = {}
    const unset = {}

    _.keys(dottedDataSet).forEach(key => {
      const value = dottedDataSet[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    DataSetsCol.update(dataSet._id, {
      $set: set,
      $unset: unset,
    })
  }
}
