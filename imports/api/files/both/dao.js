import dot from "dot-object"
import _ from "lodash"

import FilesCol from "./collection"
import createDAO from "../../baseDAO/createDAO"

export default class FilesDAO extends createDAO(FilesCol) {
  static async updateObjAsync(file) {
    const error = _.get(file, "error")

    // Removes circular reference.
    if (_.get(error, "error")) delete error.error

    const dottedFile = dot.dot(file)

    const set = {}
    const unset = {}

    _.keys(dottedFile).forEach(key => {
      const value = dottedFile[key]
      value != null ? (set[key] = value) : (unset[key] = "")
    })

    await FilesCol.updateAsync(file._id, {
      $set: set,
      $unset: unset,
    })
  }
}
