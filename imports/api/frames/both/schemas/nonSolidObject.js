import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

export default new SimpleSchema({
  _id: {
    type: String,
    label: "Non Solid Object id",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  force: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "force.$": {
    type: Number,
  },
  kineticEnergyTotal: {
    type: Number,
    label: "Kinetic energy total",
    optional: true,
  },
  kineticEnergyInternal: {
    type: Number,
    label: "Kinetic energy internal",
    optional: true,
  },
  kineticEnergyExternal: {
    type: Number,
    label: "Kinetic energy external",
    optional: true,
  },
  position: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "position.$": {
    type: Number,
  },
  velocity: {
    type: Array,
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "velocity.$": {
    type: Number,
  },
})
