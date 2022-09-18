import _ from "lodash"

import Agents from "../../agents/server/class"
import Calibrations from "./class"

export default class Hypervisor {
  constructor(calibrationId) {
    this.calibrationId = calibrationId

    const calibration = Calibrations.findOne(calibrationId)
    const calibrationObserver = Calibrations.find({ _id: calibrationId }).observe({ changed: this.keepAlive })

    const agents = _.times(calibration.agentsNumber, index => Agents.create(calibrationId, index))
    const agentsObservers = agents.map(agent => Agents.observe(agent._id, this.keepAlive))
  }

  run() {
    const calibration = Calibrations.findOne(this.calibrationId)

    Calibrations.updateObj({ _id: calibration._id, currentIteration: calibration.currentIteration + 1 })
  }

  keepAlive() {
    const calibration = Calibrations.findOne(this.calibrationId)

    if (calibration.state !== "running") return
    if (calibration.currentIteration >= calibration.maxIterations) return

    const agents = Agents.find(
      { owner: calibration._id, iteration: { $lt: calibration.currentIteration } },
      { limit: calibration.instancesNumber }
    )

    if (_.isEmpty(agents)) {
      this.run()
      return
    }

    agents.forEach(agent => Agents.start(agent._id))
  }
}
