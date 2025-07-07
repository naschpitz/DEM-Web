import "./accounts"
import "./simplSchema"

import _ from "lodash"

import "../../api/calibrations/both/methods"
import "../../api/cameras/both/methods"
import "../../api/cameraFilters/both/methods"
import "../../api/dataSets/both/methods"
import "../../api/frames/both/methods"
import "../../api/groups/both/methods"
import "../../api/logs/both/methods"
import "../../api/materials/both/methods"
import "../../api/nonSolidObjects/both/methods"
import "../../api/objectsProperties/both/methods"
import "../../api/parameters/both/methods"
import "../../api/sceneries/both/methods"
import "../../api/servers/both/methods"
import "../../api/simulations/both/methods"
import "../../api/solidObjects/both/methods"

const original_get = _.get

_.get = function (...args) {
  const defaultValue = args.length === 3 ? _.last(args) : undefined
  const result = original_get(...args)

  return _.isNaN(result) ? defaultValue : result
}
