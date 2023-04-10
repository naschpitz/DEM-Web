import "./accounts.js"
import "./simplSchema.js"

import _ from "lodash"

import "../../api/calibrations/both/methods.js"
import "../../api/cameras/both/methods.js"
import "../../api/dataSets/both/methods.js"
import "../../api/frames/both/methods.js"
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

bsSize = function () {
  const winWidth = window.innerWidth

  if (winWidth < 576) return "xs"
  else if (winWidth <= 768) return "sm"
  else if (winWidth <= 992) return "md"
  else if (winWidth <= 1200) return "lg"
  else return "xl"
}

getLanguage = function () {
  if (window.navigator.languages) return window.navigator.languages[0]
  else return window.navigator.language
}

getDecimalSeparator = function () {
  //fallback
  let decSep = "."

  try {
    // this works in FF, Chrome, IE, Safari and Opera
    let sep = parseFloat(3 / 2)
      .toLocaleString()
      .substring(1, 2)

    if (sep === "." || sep === ",") {
      decSep = sep
    }
  } catch (e) {}

  return decSep
}

getThousandSeparator = function () {
  switch (getDecimalSeparator()) {
    case ".":
      return ","

    case ",":
      return "."
  }
}

getErrorMessage = function (error) {
  let errorMessage = ""

  if (error) {
    if (error.reason) errorMessage += "[Reason: " + error.reason + "]"
    if (error.details) errorMessage += "[Details: " + error.details + "]"
  }

  return errorMessage
}

getArraysPaths = function (object) {
  const arraysPaths = []

  Object.keys(object).forEach(key => {
    const value = _.get(object, key)

    if (_.isArray(value)) arraysPaths.push(key)

    if (_.isObject(value)) {
      const subArraysPaths = getArraysPaths(value)

      subArraysPaths.forEach(subArrayPath => arraysPaths.push(key + "." + subArrayPath))
    }
  })

  return arraysPaths
}

const original_get = _.get

_.get = function (...args) {
  const defaultValue = args.length === 3 ? _.last(args) : undefined
  const result = original_get(...args)

  return _.isNaN(result) ? defaultValue : result
}
