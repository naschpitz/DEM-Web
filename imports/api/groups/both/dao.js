import dot from "dot-object"
import _ from "lodash"

import GroupsCol from "./collection.js"

export default class GroupsDAO {
  static find(...args) {
    return GroupsCol.find(...args)
  }

  static findOne(...args) {
    return GroupsCol.findOne(...args)
  }

  static insert(...args) {
    return GroupsCol.insert(...args)
  }

  static update(...args) {
    return GroupsCol.update(...args)
  }

  static upsert(...args) {
    return GroupsCol.upsert(...args)
  }

  static remove(...args) {
    return GroupsCol.remove(...args)
  }

  static updateObj(group) {
    const dottedGroup = dot.dot(group)

    const set = {}
    const unset = {}

    _.keys(dottedGroup).forEach(key => {
      const value = dottedGroup[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    GroupsCol.update(group._id, {
      $set: set,
      $unset: unset,
    })
  }
}