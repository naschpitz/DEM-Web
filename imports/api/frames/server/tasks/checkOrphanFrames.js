import { Meteor } from "meteor/meteor"

import Frames from "../../server/class"
import Sceneries from "../../../sceneries/server/class"

// Find stalled Simulations and set its state to 'failed'
const bound = Meteor.bindEnvironment(async () => {
  const sceneriesIds = await Sceneries.find({}).mapAsync(scenery => scenery._id)
  const framesIdsToDelete = await Frames.find({ owner: { $nin: sceneriesIds } }).mapAsync(frame => frame._id)

  const count = await Frames.removeAsync({ _id: { $in: framesIdsToDelete } })

  console.log(`Removed ${count} orphan frames.`)
})

const task = ready => {
  bound()
  ready()
}

export default task
