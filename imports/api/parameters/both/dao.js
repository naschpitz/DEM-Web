import dot from "dot-object"
import _ from "lodash"

import ParametersCol from "./collection.js"

export default class DataSetsDAO {
  static find(...args) {
    return ParametersCol.find(...args)
  }

  static findOne(...args) {
    return ParametersCol.findOne(...args)
  }

  static insert(...args) {
    return ParametersCol.insert(...args)
  }

  static update(...args) {
    return ParametersCol.update(...args)
  }

  static upsert(...args) {
    return ParametersCol.upsert(...args)
  }

  static remove(...args) {
    return ParametersCol.remove(...args)
  }

  static updateObj(dataSet) {
    console.log(dataSet)

    dot.keepArray = true
    const dottedDataSet = dot.dot(dataSet)

    const set = {}
    const unset = {}

    _.keys(dottedDataSet).forEach(key => {
      const value = dottedDataSet[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    ParametersCol.update(dataSet._id, {
      $set: set,
      $unset: unset,
    })
  }
}
