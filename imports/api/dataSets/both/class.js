import _ from "lodash"

import Calibrations from "../../calibrations/both/class"
import DataSetsDAO from "./dao"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Sceneries from "../../sceneries/both/class"
import Simulations from "../../simulations/both/class"
import SolidObjects from "../../solidObjects/both/class"

export default class DataSets extends DataSetsDAO {
  static async clone(oldCalibrationId, newCalibrationId) {
    const oldDataSets = DataSetsDAO.find({ owner: oldCalibrationId })

    const dataSetIdsPromises = await oldDataSets.mapAsync(async oldDataSet => {
      const newDataSet = _.cloneDeep(oldDataSet)
      delete newDataSet._id

      newDataSet.owner = newCalibrationId

      const oldObject =
        (await NonSolidObjects.findOneAsync(oldDataSet.object)) || (await SolidObjects.findOneAsync(oldDataSet.object))

      const newCalibration = await Calibrations.findOneAsync(newCalibrationId)
      const newSimulation = await Simulations.findOneAsync(newCalibration.owner)
      const newScenery = await Sceneries.findOneAsync({ owner: newSimulation._id })

      const newNonSolidObject = await NonSolidObjects.findOneAsync({
        owner: newScenery._id,
        callSign: oldObject.callSign,
      })
      const newSolidObject = await SolidObjects.findOneAsync({ owner: newScenery._id, callSign: oldObject.callSign })

      const newObject = newNonSolidObject || newSolidObject

      newDataSet.object = newObject._id

      return await DataSetsDAO.insertAsync(newDataSet)
    })

    return Promise.all(dataSetIdsPromises)
  }

  static async create(calibrationId) {
    return await DataSetsDAO.insertAsync({ owner: calibrationId })
  }

  static async removeByOwner(calibrationId) {
    await DataSetsDAO.removeAsync({ owner: calibrationId })
  }
}
