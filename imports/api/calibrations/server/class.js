import { Meteor } from "meteor/meteor"

import CalibrationsBoth from "../both/class.js"
import DataSets from "../../dataSets/both/class"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {}

  static pause(calibrationId) {}

  static stop(calibrationId) {}

  static reset(calibrationId) {}

  static removeByOwner(simulationId) {
    const calibration = Calibrations.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    Calibrations.remove(calibration._id)
  }
}
