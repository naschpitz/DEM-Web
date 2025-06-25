import { Meteor } from "meteor/meteor"

import moment from "moment"

import Logs from "../../../logs/both/class"
import Simulations from "../../both/class"

// Find stalled Simulations and set its state to 'failed'
const task = Meteor.bindEnvironment(async () => {
  const sixtySecondsAgo = moment().subtract(60, "seconds").toDate()

  const stalledSimulations = await Simulations.find({
    state: { $in: ["setToRun", "setToPause", "setToStop"] },
    updatedAt: { $lte: sixtySecondsAgo },
  }).fetchAsync()

  // For every simulation in the "running" state, check if the latest log message is older than 10 times the logTime.
  // If it is, add the simulation to the list of stalled simulations.
  const stalledRunningSimulationsPromises = await Simulations.find({ state: { $in: ["running"] } }).mapAsync(
    async simulation => {
      const latestLog = await Logs.findOneAsync({ owner: simulation._id }, { sort: { createdAt: -1 } })

      const thirtyTimesLogTimeAgo = moment()
        .subtract(30 * simulation.logTime, "seconds")
        .toDate()

      if (latestLog.createdAt <= thirtyTimesLogTimeAgo) {
        return simulation
      }

      return null
    }
  )

  const runningStalledSimulations = await Promise.all(stalledRunningSimulationsPromises)
  // Filter out the falsy values
  stalledSimulations.push(...runningStalledSimulations.filter(Boolean))

  // Will not continue with the job if there are no stalled simulations.
  // Avoids console.log pollution.
  if (stalledSimulations.length === 0) {
    return
  }

  console.log("Found " + stalledSimulations.length + " stalled Simulations.")

  const setStatePromises = stalledSimulations.map(simulation => Simulations.setState(simulation._id, "failed"))

  await Promise.allSettled(setStatePromises)

  console.log("Done checking for stalled Simulations.")
})

export default task
