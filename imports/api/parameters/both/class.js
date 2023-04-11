import _ from "lodash"

import ParametersDAO from "./dao.js"

export default class Parameters extends ParametersDAO {
  static clone(oldCalibrationId, newCalibrationId, materialsMap, nonSolidObjectsMap, solidObjectsMap) {
    const oldParameters = ParametersDAO.find({ owner: oldCalibrationId })

    const parametersMap = {}

    oldParameters.forEach(oldParameter => {
      const newParameter = _.cloneDeep(oldParameter)
      delete newParameter._id

      newParameter.owner = newCalibrationId

      switch (newParameter.type) {
        case "material":
          newParameter.materialObject = materialsMap[newParameter.materialObject]
          break
        case "nonSolidObject":
          newParameter.materialObject = nonSolidObjectsMap[newParameter.materialObject]
          break
        case "solidObject":
          newParameter.materialObject = solidObjectsMap[newParameter.materialObject]
          break
      }

      const newParameterId = ParametersDAO.insert(newParameter)

      parametersMap[oldParameter._id] = newParameterId
    })

    return parametersMap
  }

  static create(calibrationId) {
    ParametersDAO.insert({ owner: calibrationId })
  }

  static usesMaterialObject(materialObjectId) {
    const parameter = ParametersDAO.findOne({ materialObject: materialObjectId })

    return !!parameter
  }

  static removeByOwner(calibrationId) {
    ParametersDAO.remove({ owner: calibrationId })
  }
}
