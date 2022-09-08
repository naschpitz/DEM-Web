import _ from "lodash"

import CalibrationsDAO from "./dao.js"
import DataSets from "../../dataSets/both/class.js"
import Materials from "../../materials/both/class"
import Sceneries from "../../sceneries/both/class"

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

  static getMaterialsBoundaries(calibrationId) {
    const calibration = CalibrationsDAO.findOne(calibrationId)
    const scenery = Sceneries.findOne({ owner: calibration.owner })
    const materials = Materials.find({ owner: scenery._id })

    return materials.map(material => {
      return {
        callSign: material.callSign,
        coefficients: getMaxMin(material.coefficients, calibration.domain),
        dragCoefficients: getMaxMin(material.dragCoefficients, calibration.domain),
      }

      function getMaxMin(array, variation) {
        return array.map(value => {
          return {
            max: value * (1 + variation),
            min: value * (1 - variation),
          }
        })
      }
    })
  }
}
