import { Meteor } from "meteor/meteor"

import SimulationsLogs from "./class.js"

Meteor.methods({
  "simulationsLogs.insert"(simulationLog) {
    try {
      return SimulationsLogs.insert(simulationLog)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },

  "simulationsLogs.removeByOwner"(simulationId) {
    try {
      SimulationsLogs.removeByOwner(simulationId)
    } catch (error) {
      throw new Meteor.Error("500", error.message)
    }
  },
})
