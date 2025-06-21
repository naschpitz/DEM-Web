import _ from "lodash";

const getArraysPaths = function (object) {
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

export default getArraysPaths