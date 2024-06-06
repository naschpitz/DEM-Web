import { Meteor } from "meteor/meteor"

import moment from "moment"

import Logs from "../../logs/both/class"
import Simulations from "../both/class"

// Find stalled Simulations and set its state to 'failed'
const bound = Meteor.bindEnvironment(() => {
  const sixtySecondsAgo = moment().subtract(60, "seconds").toDate()

  const stalledSimulations = Simulations.find({
    state: { $in: ["setToRun", "setToPause", "setToStop"] },
    updatedAt: { $lte: sixtySecondsAgo },
  }).fetch()

  // For every simulation in the "running" state, check if the latest log message is older than 10 times the logTime.
  // If it is, add the simulation to the list of stalled simulations.
  Simulations.find({ state: { $in: ["running"] } }).forEach(simulation => {
    const latestLog = Logs.findOne({ owner: simulation._id }, { sort: { createdAt: -1 } })

    const tenTimesLogTimeAgo = moment()
      .subtract(10 * simulation.logTime, "seconds")
      .toDate()

    if (latestLog.createdAt <= tenTimesLogTimeAgo) {
      stalledSimulations.push(simulation)
    }
  })

  // Will not continue with the job if there are no stalled simulations.
  // Avoids console.log pollution.
  if (stalledSimulations.length === 0) {
    return
  }

  console.log("Found " + stalledSimulations.length + " stalled Simulations.")

  stalledSimulations.forEach(simulation => {
    Simulations.setState(simulation._id, "failed")
  })

  console.log("Done checking for stalled Simulations.")
})

const task = (ready) => {
  bound()
  ready()
}

export default task