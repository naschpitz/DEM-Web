import dot from "dot-object"
import _ from "lodash"

import AgentsHistoriesCol from "./collection.js"

export default class AgentsHistoriesDAO {
  static find(...args) {
    return AgentsHistoriesCol.find(...args)
  }

  static findOne(...args) {
    return AgentsHistoriesCol.findOne(...args)
  }

  static insert(...args) {
    return AgentsHistoriesCol.insert(...args)
  }

  static update(...args) {
    return AgentsHistoriesCol.update(...args)
  }

  static upsert(...args) {
    return AgentsHistoriesCol.upsert(...args)
  }

  static remove(...args) {
    return AgentsHistoriesCol.remove(...args)
  }

  static updateObj(agent) {
    dot.keepArray = true
    const dottedAgent = dot.dot(agent)

    const set = {}
    const unset = {}

    _.keys(dottedAgent).forEach(key => {
      const value = dottedAgent[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    AgentsHistoriesCol.update(agent._id, {
      $set: set,
      $unset: unset,
    })
  }
}
