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

  async initialize() {
    await this.log("Hypervisor initialization began.")

    const calibration = await Calibrations.findOneAsync(this.calibrationId)

    const numAgents = await Agents.find({ owner: this.calibrationId }).countAsync()
    const diffAgents = calibration.agentsNumber - numAgents

    await this.log(`Creating ${diffAgents} agents.`)
    for (let i = 0; i < diffAgents; i++) {
      await Agents.create(this.calibrationId, numAgents + i)
    }
    await this.log("Agents created.")

    await this.startObservers()

    await this.log("Hypervisor initialization ended.")

    const boundCheck = Meteor.bindEnvironment(this.check, null, this)
    this.timer = setInterval(boundCheck, 5000)
  }

  async startObservers() {
    await this.log("Initializing calibration observer.")
    this.calibrationObserver = await Calibrations.observeAsync(this.calibrationId, this.calibrationHandler.bind(this))
    await this.log("Calibration observer initialized.")

    const agents = await Agents.find({ owner: this.calibrationId }).fetchAsync()

    await this.log("Initializing agents observers.")
    const agentsObserversPromises = agents.map(async (agent) => (
      await Agents.observeAsync(agent._id, this.agentHandler.bind(this))
    ))
    this.agentsObservers = await Promise.all(agentsObserversPromises)
    await this.log("Agents observers initialized.")
  }

  async stopObservers() {
    await this.log("Stopping observers.")

    await this.log("Stopping calibration observer.")
    this.calibrationObserver.stop()
    await this.log("Calibration observer stopped.")

    await this.log("Stopping agents observers.")
    this.agentsObservers.forEach(observer => observer.stop())
    await this.log("Agents observers stopped.")

    await this.log("Observers stopped.")
  }

  async check() {
    if (!this.runCheck || this.runningCheck) return
    this.runCheck = false

    this.runningCheck = true
    await this.dispatchAgents()
    this.runningCheck = false
  }

  async dispatchAgents() {
    const calibration = await Calibrations.findOneAsync(this.calibrationId)

    if (calibration.state !== "running") return

    const numRunningAgents = await Calibrations.getNumRunningAgents(calibration._id)
    const numMissingAgents = calibration.instancesNumber - numRunningAgents

    // In case agents are started manually, numMissingAgents can be negative
    if (numMissingAgents <= 0) return

    const agents = await Agents.find({ owner: calibration._id }).fetchAsync()
    const eligibleAgentsPromises = agents.map(async (agent) => {
      const state = await Agents.getState(agent._id)

      // "new" and "paused" agents are eligible to be started
      // "failed" agents are eligible to be retried
      if (["new", "paused", "failed"].includes(state) && agent.iteration === calibration.currentIteration)
        return agent

      return null
    })

    const eligibleAgents = (await Promise.all(eligibleAgentsPromises)).filter(Boolean)

    if (numRunningAgents === 0 && eligibleAgents.length === 0) {
      await this.log("No running or eligible agents found, advancing to the next calibration iteration.")
      await Calibrations.nextIteration(this.calibrationId)
      return
    }

    if (eligibleAgents.length !== 0) {
      await this.log("Dispatching agents.")
      const agentsToStart = _.take(eligibleAgents, numMissingAgents)

      const agentsToStartPromises = agentsToStart.map(async (agent) => {
        try {
          const state = await Agents.getState(agent._id)

          if (state === "new" || state === "paused") await Agents.start(agent._id)
          if (state === "failed") await Agents.retry(agent._id)
        } catch (error) {
          await this.log(`Agent #${agent.index} simulation has failed to start.`)
        }
      })

      await Promise.all(agentsToStartPromises)
    }
  }

  async calibrationHandler(newCalibration, oldCalibration) {
    if (newCalibration.state === "paused") {
      await this.log("Calibration has paused, stopping hypervisor.")
      await this.stopObservers()
      clearInterval(this.timer)
    }

    if (newCalibration.state === "stopped") {
      await this.log("Calibration has stopped, stopping hypervisor.")
      await this.stopObservers()
      clearInterval(this.timer)
    }

    if (newCalibration.state === "done") {
      await this.log("Calibration has finished, stopping hypervisor.")
      await this.stopObservers()
      clearInterval(this.timer)
    }
  }

  async agentHandler(type, agentId, objectNew, objectOld) {
    const agent = await Agents.findOneAsync(agentId)
    const calibration = await Calibrations.findOneAsync(agent.owner)

    if (type === "frame") {
      const frame = objectNew

      if (Frames.getHighestEnergy(frame) > calibration.maxEnergy) {
        await this.log(
          `Agent #${agent.index} total kinetic energy has exceeded the maximum value set by the calibration, stopping it.`
        )

        try {
          await Agents.stop(agentId)
        } catch (error) {
          await this.log(`Agent #${agent.index} simulation has failed to stop.`)
        }
      }

      if (Frames.hasInvalidData(frame)) {
        await this.log(`Agent #${agent.index} has invalid data, stopping it.`)

        try {
          await Agents.stop(agentId)
        } catch (error) {
          await this.log(`Agent #${agent.index} simulation has failed to stop.`)
        }
      }

      this.runCheck = true
    }

    if (type === "simulation") {
      const simulationNew = objectNew
      const simulationOld = objectOld

      // If the simulation state has not changed, do nothing
      if (simulationNew.state === simulationOld.state) return;

      if (simulationNew.state === "stopped" || simulationNew.state === "done") {
        await this.log(`Agent #${agent.index} simulation has stopped.`)
      }

      if (simulationNew.state === "failed") {
        await this.log(`Agent #${agent.index} simulation has failed.`)
      }

      this.runCheck = true
    }
  }

  async log(message) {
    const calibration = await Calibrations.findOneAsync(this.calibrationId)

    const state = calibration.state
    const progress = await this.getProgress()

    await Logs.insertAsync({ owner: this.calibrationId, message: message, state: state, progress: progress })
  }

  // Should this function be moved to the Calibrations class?
  async getProgress() {
    const calibration = await Calibrations.findOneAsync(this.calibrationId)
    const currentIteration = calibration.currentIteration

    const numAgents = await Agents.find({ owner: this.calibrationId }).countAsync()
    const maxIterations = calibration.maxIterations

    // Get the number of agents to run or running
    const numNewAgents = await Calibrations.getNumNewAgents(this.calibrationId)
    const numRunningAgents = await Calibrations.getNumRunningAgents(this.calibrationId)

    const numAgentsToRun = numNewAgents + numRunningAgents

    // Get the first log message
    const firstLog = await Logs.findOneAsync({ owner: this.calibrationId }, { sort: { createdAt: 1 } })

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
