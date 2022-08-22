import dot from "dot-object"
import _ from "lodash"

import SimulationsCol from "./collection.js"

export default class SimulationsDAO {
  static find(...args) {
    return SimulationsCol.find(...args)
  }

  static findOne(...args) {
    return SimulationsCol.findOne(...args)
  }

  static insert(...args) {
    return SimulationsCol.insert(...args)
  }

  static update(...args) {
    return SimulationsCol.update(...args)
  }

  static upsert(...args) {
    return SimulationsCol.upsert(...args)
  }

  static remove(...args) {
    return SimulationsCol.remove(...args)
  }

  static updateObj(simulation) {
    const dottedSimulation = dot.dot(simulation)

    const set = {}
    const unset = {}

    _.keys(dottedSimulation).forEach(key => {
      const value = dottedSimulation[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    SimulationsCol.update(simulation._id, {
      $set: set,
      $unset: unset,
    })
  }
}
