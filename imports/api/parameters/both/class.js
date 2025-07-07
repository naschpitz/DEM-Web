import _ from "lodash"

import ParametersDAO from "./dao"

export default class Parameters extends ParametersDAO {
  static async clone(oldCalibrationId, newCalibrationId, materialsMap, nonSolidObjectsMap, solidObjectsMap) {
    const oldParameters = await ParametersDAO.find({ owner: oldCalibrationId }).fetchAsync()

    const parametersMap = {}

    for (const oldParameter of oldParameters) {
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

      const newParameterId = await ParametersDAO.insertAsync(newParameter)

      parametersMap[oldParameter._id] = newParameterId
    }

    return parametersMap
  }

  static async create(calibrationId) {
    await ParametersDAO.insertAsync({ owner: calibrationId })
  }

  static async usesMaterialObject(materialObjectId) {
    const parameter = await ParametersDAO.findOneAsync({ materialObject: materialObjectId })

    return !!parameter
  }

  static async removeByOwner(calibrationId) {
    await ParametersDAO.removeAsync({ owner: calibrationId })
  }
}
