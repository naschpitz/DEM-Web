import { Meteor } from "meteor/meteor"
import { CronJob } from "cron"

import Calibrations from "../both/class"
import Hypervisor from "./hypervisor"

// Find Calibrations in progress and re-initialize them
const bound = Meteor.bindEnvironment(onComplete => {
  const calibrationsInProgress = Calibrations.find({
    state: { $in: ["running", "paused"] },
  })

  // Will not continue with the job if there are no calibrations in progress.
  // Avoids console.log pollution.
  if (calibrationsInProgress.count() === 0) {
    return
  }

  console.log("Found " + calibrationsInProgress.count() + " Calibrations in progress, initializing Hypervisors.")

  calibrationsInProgress.forEach(calibration => {
    const hypervisor = new Hypervisor(calibration._id)

    try {
      hypervisor.initialize()
    } catch (error) {
      console.log(error)
    }
  })

  console.log("Done checking for Calibrations in progress.")
})

const job = new CronJob(
  // Every 5 minutes
  "* */5 * * * *",
  bound, // This function is executed when the job runs
  null, // This function is executed when the job stops
  null, // Start the job right now
  null, // Time zone of this job.
  null, // The context to run jobCallback with
  true // Run the job in the initialisation
)

job.start()
job.stop()
