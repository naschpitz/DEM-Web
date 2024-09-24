import _ from "lodash"

import Agents from "../../agents/both/class";
import CalibrationsDAO from "./dao.js"
import DataSets from "../../dataSets/both/class.js"
import Parameters from "../../parameters/both/class"

export default class Calibrations extends CalibrationsDAO {
  static clone(oldSimulationId, newSimulationId, materialsMap, nonSolidObjectsMap, solidObjectsMap) {
    const oldCalibration = CalibrationsDAO.findOne({ owner: oldSimulationId })

    const newCalibration = _.cloneDeep(oldCalibration)
    delete newCalibration._id

    newCalibration.owner = newSimulationId
    newCalibration.state = "new"
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

  static checkStopCondition(calibrationId) {
    const calibration = CalibrationsDAO.findOne(calibrationId)

    const bestScores = Agents.getBestScores(calibrationId)

    if (bestScores.length >= calibration.numIterations) {
      // Get the last numIterations scores
      const lastScores = bestScores.slice(-calibration.numIterations)

      // Check if each of the lastScores is smaller than the previous one by minPercentage
      const isImproving = lastScores.every((score, index) => {
        if (index === 0) return true

        return score < (lastScores[index - 1] * (1 - calibration.minPercentage))
      })

      // If it is not improving, return true, which means that the calibration has met the stop condition
      return !isImproving;
    }

    return false;
  }
}
