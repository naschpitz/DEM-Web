import _ from "lodash"

import Agents from "../../agents/both/class"
import CalibrationsBoth from "../both/class.js"
import DataSets from "../../dataSets/both/class"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {
    const calibration = Calibrations.findOne(calibrationId)

    const agents = _.times(calibration.agents, i => Agents.create(calibrationId, i))
  }

  static pause(calibrationId) {}

  static stop(calibrationId) {}

  static reset(calibrationId) {}

  static removeByOwner(simulationId) {
    const calibration = Calibrations.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    Calibrations.remove(calibration._id)
  }
}
