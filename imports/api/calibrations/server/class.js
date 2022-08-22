import { Meteor } from "meteor/meteor"

import CalibrationsBoth from "../both/class.js"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {}

  static pause(calibrationId) {}

  static stop(calibrationId) {}

  static reset(calibrationId) {}

  static removeByOwner(simulationId) {}
}
