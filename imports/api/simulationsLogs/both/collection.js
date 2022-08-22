import { Mongo } from "meteor/mongo"
import SimpleSchema from "simpl-schema"

import Progress from "./schemas/progress.js"

const SimulationsLogs = new Mongo.Collection("simulationsLogs")

SimulationsLogs.schema = new SimpleSchema({
  owner: {
    type: String,
    label: "Simulation owner",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  message: {
    type: String,
    label: "Message",
    optional: true,
  },
  progress: {
    type: Progress,
    label: "Progress",
    optional: true,
  },
  state: {
    type: String,
    label: "State",
    allowedValues: ["new", "running", "paused", "stopped", "done"],
    defaultValue: "new",
    optional: true,
  },
  createdAt: {
    type: Date,
    label: "Created at",
    optional: true,
    autoValue: function () {
      if (this.isInsert) return new Date()
      else if (this.isUpsert) return { $setOnInsert: new Date() }
      else this.unset()
    },
  },
  updatedAt: {
    type: Date,
    label: "Updated at",
    autoValue: function () {
      return new Date()
    },
  },
})

SimulationsLogs.attachSchema(SimulationsLogs.schema)

export default SimulationsLogs
