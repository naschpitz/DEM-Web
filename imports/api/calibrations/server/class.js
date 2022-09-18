import _ from "lodash"

import Agents from "../../agents/server/class"
import CalibrationsBoth from "../both/class.js"
import DataSets from "../../dataSets/both/class"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {
    const calibration = Calibrations.findOne(calibrationId)

    const agents = _.times(calibration.agentsNumber, index => Agents.create(calibrationId, index))
  }

  static pause(calibrationId) {
    const agents = Agents.find({ owner: calibrationId })

    agents.forEach(agent => Agents.pause(agent._id))
  }

  static stop(calibrationId) {
    const agents = Agents.find({ owner: calibrationId })

    agents.forEach(agent => Agents.stop(agent._id))
  }

  static reset(calibrationId) {
    const agents = Agents.find({ owner: calibrationId })

    CalibrationsBoth.update(calibrationId, { currentIteration: 0 })
    agents.forEach(agent => Agents.reset(agent._id))
  }

  static removeByOwner(simulationId) {
    const calibration = Calibrations.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    Calibrations.remove(calibration._id)
  }
}
