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

    this.log("Initializing calibration observer.")
    this.calibrationObserver = Calibrations.observe(this.calibrationId, this.calibrationHandler.bind(this))
    this.log("Calibration observer initialized.")

    this.log("Creating agents.")
    const agentsIds = _.times(calibration.agentsNumber, index => Agents.create(this.calibrationId, index))
    this.log("Agents created.")

    this.log("Initializing agents observers.")
    this.agentsObservers = agentsIds.map(agentId => Agents.observe(agentId, this.agentHandler.bind(this)))
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

  dispatchAgents(calibration) {
    this.log("Dispatching agents.")

    // Do not dispatch agents if the calibration is not running or if there are no more iterations to run.
    if (calibration.state !== "running" || calibration.currentIteration >= calibration.maxIterations) {
      this.log("Calibration not running or no more iterations to run.")
      return
    }

    let numRunningAgents = Calibrations.getNumRunningAgents(calibration._id)
    const numMissingAgents = calibration.instancesNumber - numRunningAgents

    if (numMissingAgents === 0) return

    const eligibleAgents = Agents.find({ owner: calibration._id })
      .fetch()
      .filter(agent => {
        const state = Agents.getState(agent._id)

        if (state === "new" && agent.iteration === calibration.currentIteration) return true
        if (state === "paused" && agent.iteration === calibration.currentIteration + 1) return true

        return false
      })

    if (eligibleAgents.length === 0) {
      this.log("No eligible agents found, advancing to the next calibration iteration.")
      Calibrations.nextIteration(this.calibrationId)
      return
    }

    const agentsToStart = _.take(eligibleAgents, numMissingAgents)
    agentsToStart.forEach(agent => Agents.start(agent._id))
  }

  calibrationHandler(calibration) {
    if (calibration.state === "new") return

    if (calibration.state !== "running" || calibration.currentIteration >= calibration.maxIterations) {
      this.log("Calibration not running or no more iterations to run.")
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
    }

    if (type === "simulation") {
      const simulation = object

      if (simulation.state === "stopped") {
        this.log(`Agent #${agent.index} simulation has stopped.`)
        this.dispatchAgents(calibration)
      }
    }
  }

  log(message) {
    Logs.insert({ owner: this.calibrationId, message: message })
  }
}
