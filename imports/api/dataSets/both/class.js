import DataSetsDAO from "./dao"

export default class DataSets extends DataSetsDAO {
  static clone(oldCalibrationId, newCalibrationId) {
    const oldDataSets = DataSetsDAO.find({ owner: oldCalibrationId })

    oldDataSets.forEach(oldDataSet => {
      const newDataSet = _.cloneDeep(oldDataSet)
      delete newDataSet._id
      newDataSet.owner = newCalibrationId

      DataSetsDAO.insert(newDataSet)
    })
  }

  static create(calibrationId) {
    const dataSetId = DataSetsDAO.insert({ owner: calibrationId })

    return dataSetId
  }

  static removeByOwner(calibrationId) {
    DataSetsDAO.remove({ owner: calibrationId })
  }
}
