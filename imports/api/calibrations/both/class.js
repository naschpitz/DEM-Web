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

    const numScores = calibration.numIntervals + 1
    const bestScores = Agents.getBestScores(calibrationId)

    // Note: smaller scores are better, they mean less error
    if (bestScores.length >= numScores) {
      // Get the last numScore scores
      const lastScores = bestScores.slice(-numScores)

      // Check if each of the lastScores is smaller than the previous one by minPercentage
      // If at least one score is smaller than the previous one by minPercentage, the calibration is improving
      const isImproving = lastScores.some((score, index) => {
        if (index === 0) return false

        // Check if the score is smaller than the previous one by minPercentage
        // If it is smaller, return true, which means that the calibration is improving
        return score < (lastScores[index - 1] * (1 - calibration.minPercentage))
      })

      // If it is not improving, return true, which means that the calibration has met the stop condition
      return !isImproving;
    }

    return false;
  }
}
