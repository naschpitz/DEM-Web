import dot from "dot-object"
import _ from "lodash"

import VideosCol from "./collection.js"
import createDAO from "../../baseDAO/createDAO.js"

export default class VideosDAO extends createDAO(VideosCol) {
  static updateObj(video) {
    const error = _.get(video, "meta.error")

    // Removes circular reference.
    if (_.get(error, "error"))
      delete error.error

    const dottedVideo = dot.dot(video)

    const set = {}
    const unset = {}

    _.keys(dottedVideo).forEach((key) => {
      const value = dottedVideo[key]
      value != null ? set[key] = value : unset[key] = ""
    })

    VideosCol.update(video._id, {
        $set: set,
        $unset: unset
    })
  }
}