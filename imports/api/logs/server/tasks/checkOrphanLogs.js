import { Meteor } from "meteor/meteor"

import Calibrations from "../../../calibrations/both/class"
import Logs from "../../../logs/both/class"
import Simulations from "../../../simulations/both/class"

// Find stalled Simulations and set its state to 'failed'
const bound = Meteor.bindEnvironment(() => {
  const simulationsIds = Simulations.find({}).map(simulation => simulation._id)
  const calibrationsIds = Calibrations.find({}).map(calibration => calibration._id)

  // Merge the two arrays
  const ids = simulationsIds.concat(calibrationsIds)

  // Find all logs whose owner is not in the ids array
  const logsIdsToDelete = Logs.find({ owner: { $nin: ids } }).map(log => log._id)

  // Remove the logs
  const count = Logs.remove({ _id: { $in: logsIdsToDelete } })

  console.log(`Removed ${count} orphan logs.`)
})

const task = (ready) => {
  bound()
  ready()
}

export default task