import { Meteor } from "meteor/meteor"

import Frames from "../../server/class"
import Sceneries from "../../../sceneries/server/class"

// Find stalled Simulations and set its state to 'failed'
const bound = Meteor.bindEnvironment(() => {
  const sceneriesIds = Sceneries.find({}).map(scenery => scenery._id)
  const framesIdsToDelete = Frames.find({ owner: { $nin: sceneriesIds } }).map(frame => frame._id)

  const count = Frames.remove({ _id: { $in: framesIdsToDelete } })

  console.log(`Removed ${count} orphan frames.`)
})

const task = (ready) => {
  bound()
  ready()
}

export default task