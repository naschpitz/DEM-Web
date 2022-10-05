import _ from "lodash"

import CalibrationsDAO from "./dao.js"
import DataSets from "../../dataSets/both/class.js"

export default class Calibrations extends CalibrationsDAO {
  static clone(oldSimulationId, newSimulationId) {
    const oldCalibration = CalibrationsDAO.findOne({ owner: oldSimulationId })

    const newCalibration = _.cloneDeep(oldCalibration)
    delete newCalibration._id
    newCalibration.owner = newSimulationId

    const oldCalibrationId = oldCalibration._id
    const newCalibrationId = CalibrationsDAO.insert(newCalibration)

    DataSets.clone(oldCalibrationId, newCalibrationId)

    return newCalibrationId
  }

  static create(simulationId) {
    CalibrationsDAO.insert({ owner: simulationId })
  }

  static setState(calibrationId, state) {
    const calibration = {
      _id: calibrationId,
      state: state,
    }

    CalibrationsDAO.updateObj(calibration)
  }

  static usesServer(serverId) {
    const calibrationFound = CalibrationsDAO.findOne({ server: serverId, state: { $in: ["paused", "running"] } })

    return !!calibrationFound
  }

  static removeByOwner(simulationId) {
    const calibration = CalibrationsDAO.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    CalibrationsDAO.remove(calibration._id)
  }

  static removeServer(serverId) {
    CalibrationsDAO.update(
      {
        server: serverId,
        state: { $nin: ["paused", "running"] },
      },
      {
        $unset: {
          server: "",
        },
      }
    )
  }
}
