import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

export default new SimpleSchema({
  step: {
    type: Number,
    label: "Step",
    optional: true,
  },
  totalSteps: {
    type: Number,
    label: "Step",
    optional: true,
  },
  time: {
    type: Number,
    label: "Time",
    optional: true,
  },
  et: {
    type: Number,
    label: "ET",
    optional: true,
  },
  eta: {
    type: Number,
    label: "ETA",
    optional: true,
  },
})
