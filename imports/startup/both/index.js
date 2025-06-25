import "./accounts.js"
import "./simplSchema.js"

import _ from "lodash"

import "../../api/calibrations/both/methods.js"
import "../../api/cameras/both/methods.js"
import "../../api/cameraFilters/both/methods.js"
import "../../api/dataSets/both/methods.js"
import "../../api/frames/both/methods.js"
import "../../api/groups/both/methods.js"
import "../../api/logs/both/methods.js"
import "../../api/materials/both/methods.js"
import "../../api/nonSolidObjects/both/methods.js"
import "../../api/objectsProperties/both/methods.js"
import "../../api/parameters/both/methods.js"
import "../../api/sceneries/both/methods.js"
import "../../api/servers/both/methods.js"
import "../../api/simulations/both/methods.js"
import "../../api/solidObjects/both/methods.js"
import "../../api/videos/both/methods.js"

const original_get = _.get

_.get = function (...args) {
  const defaultValue = args.length === 3 ? _.last(args) : undefined
  const result = original_get(...args)

  return _.isNaN(result) ? defaultValue : result
}
