import { Meteor } from "meteor/meteor"

import restartCalibrationsTask from "../../calibrations/server/task/restartCalibrations"
import checkStalledSimulationsTask from "../../simulations/server/tasks/checkStalledSimulations"

// Run calibration restart task immediately on startup
Meteor.startup(() => {
  try {
    restartCalibrationsTask()
  } catch (error) {
    console.log("Error in calibration restart task:", error)
  }
})

// Run stalled simulations check every 10 seconds
const stalledSimulationsInterval = setInterval(() => {
  try {
    checkStalledSimulationsTask()
  } catch (error) {
    console.log("Error in stalled simulations check:", error)
  }
}, 10 * 1000) // 10 seconds

// Clean up interval on server shutdown (optional)
process.on('SIGTERM', () => {
  clearInterval(stalledSimulationsInterval)
})

process.on('SIGINT', () => {
  clearInterval(stalledSimulationsInterval)
})