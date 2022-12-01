import _ from "lodash"

import Agents from "../../agents/server/class"
import Calibrations from "./class"
import Logs from "../../logs/both/class"

export default class Hypervisor {
  constructor(calibrationId) {
    this.calibrationId = calibrationId
  }

  initialize() {
    this.log("Hypervisor initialization began.")

    const calibration = Calibrations.findOne(this.calibrationId)

    this.log("Initializing calibration observer.")
    this.calibrationObserver = Calibrations.observe(this.calibrationId, this.calibrationHandler.bind(this))
    this.log("Calibration observer initialized.")

    this.log("Creating agents.")
    const agentsIds = _.times(calibration.agentsNumber, index => Agents.create(this.calibrationId, index))
    this.log("Agents created.")

    this.log("Initializing agents observers.")
    this.agentsObservers = agentsIds.map(agentId => Agents.observe(agentId, this.agentHandler))
    this.log("Agents observers initialized.")

    this.log("Hypervisor initialization ended.")
  }

  stopObservers() {
    this.log("Stopping observers.")

    this.log("Stopping calibration observer.")
    this.calibrationObserver.stop()
    this.log("Calibration observer stopped.")

    this.log("Stopping agents observers.")
    this.agentsObservers.forEach(observer => observer.stop())
    this.log("Agents observers stopped.")

    this.log("Observers stopped.")
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

  log(message) {
    Logs.insert({ owner: this.calibrationId, message: message })
  }
}
