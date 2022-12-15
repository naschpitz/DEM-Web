import _ from "lodash"

import Calibrations from "../../calibrations/both/class"
import DataSetsDAO from "./dao"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Sceneries from "../../sceneries/both/class"
import Simulations from "../../simulations/both/class"
import SolidObjects from "../../solidObjects/both/class"

export default class DataSets extends DataSetsDAO {
  static clone(oldCalibrationId, newCalibrationId) {
    const oldDataSets = DataSetsDAO.find({ owner: oldCalibrationId })

    const dataSetIds = oldDataSets.map(oldDataSet => {
      const newDataSet = _.cloneDeep(oldDataSet)
      delete newDataSet._id

      newDataSet.owner = newCalibrationId

      const oldObject = NonSolidObjects.findOne(oldDataSet.object) || SolidObjects.findOne(oldDataSet.object)

      const newCalibration = Calibrations.findOne(newCalibrationId)
      const newSimulation = Simulations.findOne(newCalibration.owner)
      const newScenery = Sceneries.findOne({ owner: newSimulation._id })

      const newNonSolidObject = NonSolidObjects.findOne({ owner: newScenery._id, callSign: oldObject.callSign })
      const newSolidObject = SolidObjects.findOne({ owner: newScenery._id, callSign: oldObject.callSign })

      const newObject = newNonSolidObject || newSolidObject

      newDataSet.object = newObject._id

      DataSetsDAO.insert(newDataSet)
    })

    return dataSetIds
  }

  static create(calibrationId) {
    return DataSetsDAO.insert({ owner: calibrationId })
  }

  static removeByOwner(calibrationId) {
    DataSetsDAO.remove({ owner: calibrationId })
  }
}
