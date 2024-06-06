import { Meteor } from "meteor/meteor"
import _ from "lodash"

import Agents from "../../agents/server/class"
import Calibrations from "./class"
import Frames from "../../frames/both/class"
import Logs from "../../logs/both/class"

export default class Hypervisor {
  constructor(calibrationId) {
    this.calibrationId = calibrationId
    this.runCheck = true
    this.runningCheck = false
    this.timer = null
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

    this.log("Hypervisor initialization ended.")

    const boundCheck = Meteor.bindEnvironment(this.check, null, this)
    this.timer = setInterval(boundCheck, 5000)
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

  async check() {
    if (!this.runCheck || this.runningCheck) return
    this.runCheck = false

    this.runningCheck = true
    await this.dispatchAgents()
    this.runningCheck = false
  }

  async dispatchAgents() {
    const calibration = Calibrations.findOne(this.calibrationId)

    if (calibration.state !== "running") return

    let numRunningAgents = Calibrations.getNumRunningAgents(calibration._id)
    const numMissingAgents = calibration.instancesNumber - numRunningAgents

    // In case agents are started manually, numMissingAgents can be negative
    if (numMissingAgents <= 0) return

    const eligibleAgents = Agents.find({ owner: calibration._id })
      .fetch()
      .filter(agent => {
        const state = Agents.getState(agent._id)

        // "new" and "paused" agents are eligible to be started
        // "failed" agents are eligible to be restarted
        if (["new", "paused", "failed"].includes(state) && agent.iteration === calibration.currentIteration) return true

        return false
      })

    if (numRunningAgents === 0 && eligibleAgents.length === 0) {
      this.log("No running or eligible agents found, advancing to the next calibration iteration.")
      await Calibrations.nextIteration(this.calibrationId)
      return
    }

    if (eligibleAgents.length !== 0) {
      this.log("Dispatching agents.")
      const agentsToStart = _.take(eligibleAgents, numMissingAgents)
      agentsToStart.forEach(agent => {
        try {
          const state = Agents.getState(agent._id)

          if (state === "new" || state === "paused") Agents.start(agent._id)
          if (state === "failed") Agents.restart(agent._id)
        } catch (error) {
          this.log(`Agent #${agent.index} simulation has failed to start.`)
        }
      })
    }
  }

  calibrationHandler(calibration) {
    if (calibration.state === "stopped") {
      this.log("Calibration has stopped, stopping hypervisor.")
      this.stopObservers()
      clearInterval(this.timer)
    }
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

        try {
          Agents.stop(agentId)
        } catch (error) {
          this.log(`Agent #${agent.index} simulation has failed to stop.`)
        }
      }

      if (Frames.hasInvalidData(frame)) {
        this.log(`Agent #${agent.index} has invalid data, stopping it.`)

        try {
          Agents.stop(agentId)
        } catch (error) {
          this.log(`Agent #${agent.index} simulation has failed to stop.`)
        }
      }

      this.runCheck = true
    }

    if (type === "simulation") {
      const simulation = object

      if (simulation.state === "stopped" || simulation.state === "done") {
        this.log(`Agent #${agent.index} simulation has stopped.`)
      }

      if (simulation.state === "failed") {
        this.log(`Agent #${agent.index} simulation has failed.`)
      }

      this.runCheck = true
    }
  }

  log(message) {
    const calibration = Calibrations.findOne(this.calibrationId)

    const state = calibration.state
    const progress = this.getProgress()

    Logs.insert({ owner: this.calibrationId, message: message, state: state, progress: progress })
  }

  // Should this function be moved to the Calibrations class?
  getProgress() {
    const calibration = Calibrations.findOne(this.calibrationId)
    const currentIteration = calibration.currentIteration

    const numAgents = Agents.find({ owner: this.calibrationId }).count()
    const maxIterations = calibration.maxIterations

    // Get the number of agents to run or running
    const numNewAgents = Calibrations.getNumNewAgents(this.calibrationId)
    const numRunningAgents = Calibrations.getNumRunningAgents(this.calibrationId)

    const numAgentsToRun = numNewAgents + numRunningAgents

    // Get the first log message
    const firstLog = Logs.findOne({ owner: this.calibrationId }, { sort: { createdAt: 1 } })

    if (!firstLog) return undefined

    // Calculate the elapsed time in seconds
    const et = (new Date() - firstLog.createdAt) / 1000

    const step = currentIteration * numAgents + numAgents - numAgentsToRun
    const totalSteps = numAgents * maxIterations

    const eta = step !== 0 ? et * (totalSteps - step) / step : undefined

    return {
      step: step,
      totalSteps: totalSteps,
      et: et,
      eta: eta,
    }
  }
}
