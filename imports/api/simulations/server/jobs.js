import { Meteor } from "meteor/meteor"
import { CronJob } from "cron"
import moment from "moment"

import Simulations from "../both/class"

// Find stalled Simulations and set its state to 'fail'
const bound = Meteor.bindEnvironment(() => {
  const tenSecondsAgo = moment().subtract(10, "seconds").toDate()

  const stalledSimulations = Simulations.find({
    state: { $in: ["setToRun", "setToPause", "setToStop"] },
    updatedAt: { $lte: tenSecondsAgo },
  })

  // Will not continue with the job if there are no stalled simulations.
  // Avoids console.log pollution.
  if (stalledSimulations.count() === 0) {
    return
  }

  console.log("Found " + stalledSimulations.count() + " stalled Simulations.")

  stalledSimulations.forEach(simulation => {
    Simulations.setState(simulation._id, "failed")
  })

  console.log("Done checking for stalled Simulations.")
})

const job = new CronJob(
  // Every 10 seconds
  "*/10 * * * * *",
  bound
)

job.start()
