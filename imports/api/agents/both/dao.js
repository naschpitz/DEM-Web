import dot from "dot-object"
import _ from "lodash"

import AgentsCol from "./collection.js"

export default class AgentsDAO {
  static find(...args) {
    return AgentsCol.find(...args)
  }

  static findOne(...args) {
    return AgentsCol.findOne(...args)
  }

  static insert(...args) {
    return AgentsCol.insert(...args)
  }

  static update(...args) {
    return AgentsCol.update(...args)
  }

  static upsert(...args) {
    return AgentsCol.upsert(...args)
  }

  static remove(...args) {
    return AgentsCol.remove(...args)
  }

  static updateObj(agent) {
    const dottedAgent = dot.dot(agent)

    const set = {}
    const unset = {}

    _.keys(dottedAgent).forEach(key => {
      const value = dottedAgent[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    AgentsCol.update(agent._id, {
      $set: set,
      $unset: unset,
    })
  }
}
