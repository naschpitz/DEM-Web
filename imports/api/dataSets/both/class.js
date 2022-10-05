import _ from "lodash"

import DataSetsDAO from "./dao"

export default class DataSets extends DataSetsDAO {
  static clone(oldCalibrationId, newCalibrationId) {
    const oldDataSets = DataSetsDAO.find({ owner: oldCalibrationId })

    const dataSetIds = oldDataSets.map(oldDataSet => {
      const newDataSet = _.cloneDeep(oldDataSet)
      delete newDataSet._id
      newDataSet.owner = newCalibrationId

      DataSetsDAO.insert(newDataSet)
    })

    return dataSetIds
  }

  static create(calibrationId) {
    const dataSetId = DataSetsDAO.insert({ owner: calibrationId })

    return dataSetId
  }

  static removeByOwner(calibrationId) {
    DataSetsDAO.remove({ owner: calibrationId })
  }
}
