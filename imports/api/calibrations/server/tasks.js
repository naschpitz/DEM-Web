import { Meteor } from "meteor/meteor"

import Calibrations from "../both/class"
import Hypervisor from "./hypervisor"

// Find Calibrations in progress and re-initialize them
const bound = Meteor.bindEnvironment(() => {
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

const task = (ready) => {
  bound()
  ready()
}

export default task
