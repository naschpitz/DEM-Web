import { Meteor } from "meteor/meteor"

import Simulations from "../../both/class"

// Find stalled Simulations and set its state to 'failed'
const bound = Meteor.bindEnvironment(() => {
  const simulations = Simulations.find({})


})

const task = (ready) => {
  bound()
  ready()
}

export default task