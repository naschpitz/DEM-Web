import _ from "lodash"

import CalibrationsDAO from "./dao.js"
import Agents from "../../agents/both/class.js"
import DataSets from "../../dataSets/both/class.js"
import Logs from "../../logs/both/class.js"
import Parameters from "../../parameters/both/class"

export default class Calibrations extends CalibrationsDAO {
  static clone(oldSimulationId, newSimulationId, materialsMap, nonSolidObjectsMap, solidObjectsMap) {
    const oldCalibration = CalibrationsDAO.findOne({ owner: oldSimulationId })

    const newCalibration = _.cloneDeep(oldCalibration)
    delete newCalibration._id

    newCalibration.owner = newSimulationId
    newCalibration.currentIteration = 0

    const oldCalibrationId = oldCalibration._id
    const newCalibrationId = CalibrationsDAO.insert(newCalibration)

    Parameters.clone(oldCalibrationId, newCalibrationId, materialsMap, nonSolidObjectsMap, solidObjectsMap)
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

  static getState(calibration) {
    switch (calibration?.state) {
      case "new":
        return "New"
      case "running":
        return "Running"
      case "paused":
        return "Paused"
      case "stopped":
        return "Stopped"
      case "done":
        return "Done"
      default:
        return "N/A"
    }
  }
}
