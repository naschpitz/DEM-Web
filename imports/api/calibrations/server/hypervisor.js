import _ from "lodash"

import Agents from "../../agents/server/class"
import Calibrations from "./class"
import Frames from "../../frames/both/class"
import Logs from "../../logs/both/class"

export default class Hypervisor {
  constructor(calibrationId) {
    this.calibrationId = calibrationId
  }

  initialize() {
    this.log("Hypervisor initialization began.")

    const calibration = Calibrations.findOne(this.calibrationId)

    const numAgents = Agents.find({ owner: this.calibrationId }).count()
    const diffAgents = calibration.agentsNumber - numAgents

    this.log(`Creating ${diffAgents} agents.`)
    _.times(diffAgents, index => Agents.create(this.calibrationId, index))
    this.log("Agents created.")

    this.startObservers()

    if (calibration.state === "running") this.dispatchAgents(calibration)

    this.log("Hypervisor initialization ended.")
  }

  startObservers() {
    this.log("Initializing calibration observer.")
    this.calibrationObserver = Calibrations.observe(this.calibrationId, this.calibrationHandler.bind(this))
    this.log("Calibration observer initialized.")

    const agents = Agents.find({ owner: this.calibrationId })

    this.log("Initializing agents observers.")
    this.agentsObservers = agents.map(agent => Agents.observe(agent._id, this.agentHandler.bind(this)))
    this.log("Agents observers initialized.")
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

  dispatchAgents(calibration) {
    this.log("Dispatching agents.")

    let numRunningAgents = Calibrations.getNumRunningAgents(calibration._id)
    const numMissingAgents = calibration.instancesNumber - numRunningAgents

    if (numMissingAgents === 0) return

    const eligibleAgents = Agents.find({ owner: calibration._id })
      .fetch()
      .filter(agent => {
        const state = Agents.getState(agent._id)

        if (["new", "paused"].includes(state) && agent.iteration === calibration.currentIteration) return true

        return false
      })

    if (numRunningAgents === 0 && eligibleAgents.length === 0) {
      this.log("No running or eligible agents found, advancing to the next calibration iteration.")
      Calibrations.nextIteration(this.calibrationId)
      return
    }

    const agentsToStart = _.take(eligibleAgents, numMissingAgents)
    agentsToStart.forEach(agent => Agents.start(agent._id))
  }

  calibrationHandler(calibration) {
    if (calibration.state !== "running") {
      return
    }

    this.dispatchAgents(calibration)
  }

  agentHandler(type, agentId, object) {
    const agent = Agents.findOne(agentId)
    const calibration = Calibrations.findOne(agent.owner)

    if (type === "frame") {
      const frame = object

      if (Frames.getHighestEnergy(frame) > calibration.maxEnergy) {
        this.log(
          `Agent #${agent.index} total kinetic energy has exceeded the maximum value set by the calibration, stopping it.`
        )
        Agents.stop(agentId)
      }

      if (Frames.hasInvalidData(frame)) {
        this.log(`Agent #${agent.index} has invalid data, stopping it.`)
        Agents.stop(agentId)
      }
    }

    if (type === "simulation") {
      const simulation = object

      if (simulation.state === "stopped" || simulation.state === "done") {
        this.log(`Agent #${agent.index} simulation has stopped.`)
        this.dispatchAgents(calibration)
      }

      if (simulation.state === "failed") {
        this.log(`Agent #${agent.index} simulation has failed.`)
        Agents.retry(agentId)
      }
    }
  }

  log(message) {
    Logs.insert({ owner: this.calibrationId, message: message })
  }
}
