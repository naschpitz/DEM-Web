import { Meteor } from "meteor/meteor"

import Calibrations from "../../both/class"
import HypervisorManager from "../hypervisorManager"

// Find Calibrations in progress and re-initialize them
const task = Meteor.bindEnvironment(async () => {
  const calibrationsInProgressPromises = Calibrations.find({
    state: { $in: ["running", "paused"] },
  })

  const numCalibrationsInProgress = await calibrationsInProgressPromises.countAsync()

  // Will not continue with the job if there are no calibrations in progress.
  // Avoids console.log pollution.
  if (numCalibrationsInProgress === 0) {
    return
  }

  console.log("Found " + numCalibrationsInProgress + " Calibrations in progress, initializing Hypervisors.")

  const calibrationsInProgress = await calibrationsInProgressPromises.fetchAsync()

  for (const calibration of calibrationsInProgress) {
    const hypervisor = HypervisorManager.getInstance(calibration._id)

    try {
      await hypervisor.initialize()
    } catch (error) {
      console.log(error)
    }
  }

  console.log("Done checking for Calibrations in progress.")
})

export default task
