import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

export default new SimpleSchema({
  fixed: {
    type: Boolean,
    label: "Fixed",
    optional: true,
  },
  originalPosition: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "originalPosition.$": {
    type: Number,
  },
  currentPosition: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "currentPosition.$": {
    type: Number,
  },
  originalVelocity: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "originalVelocity.$": {
    type: Number,
  },
  currentVelocity: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "currentVelocity.$": {
    type: Number,
  },
})
