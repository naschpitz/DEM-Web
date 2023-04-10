import _ from "lodash"

import ParametersDAO from "./dao.js"

export default class Parameters extends ParametersDAO {
  static clone(oldCalibrationId, newCalibrationId) {
    const oldParameter = ParametersDAO.findOne({ owner: oldCalibrationId })

    const newParameter = _.clone(oldParameter)
    delete newParameter._id
    newParameter.owner = newCalibrationId

    const newParameterId = ParametersDAO.insert(newParameter)

    return newParameterId
  }

  static create(calibrationId) {
    ParametersDAO.insert({ owner: calibrationId })
  }

  static removeByOwner(calibrationId) {
    ParametersDAO.remove({ owner: calibrationId })
  }
}
