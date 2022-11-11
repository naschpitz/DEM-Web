import _ from "lodash"

import Agents from "../../agents/server/class"
import Calibrations from "./class"

export default class Hypervisor {
  constructor(calibrationId) {
    this.calibrationId = calibrationId
  }

  initialize() {
    const calibration = Calibrations.findOne(this.calibrationId)
    this.calibrationObserver = Calibrations.observe(this.calibrationId, this.calibrationHandler.bind(this))

    const agentsIds = _.times(calibration.agentsNumber, index => Agents.create(this.calibrationId, index))
    this.agentsObservers = agentsIds.map(agentId => Agents.observe(agentId, this.agentHandler))
  }

  stopObservers() {
    this.calibrationObserver.stop()
    this.agentsObservers.forEach(observer => observer.stop())
  }

  calibrationHandler(calibration) {
    if (calibration.state !== "running" || calibration.currentIteration >= calibration.maxIterations) {
      this.stopObservers()
      return
    }

    let numRunningAgents = Calibrations.getNumRunningAgents(this.calibrationId)
    const numMissingAgents = calibration.instancesNumber - numRunningAgents

    if (numMissingAgents === 0) return

    const eligibleAgents = Agents.find({
      owner: this.calibrationId,
      iteration: { lt: calibration.currentIteration },
    }).fetch()

    if (eligibleAgents.length === 0) {
      Calibrations.nextIteration(this.calibrationId)
      return
    }

    const agentsToStart = _.take(eligibleAgents, numMissingAgents)
    agentsToStart.forEach(agent => Agents.start(agent._id))
  }

  agentHandler(type, object) {
    console.log("Hypervisor agentHandler() called.")
    console.log(type, object)
  }
}
