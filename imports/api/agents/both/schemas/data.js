import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

export default Data = new SimpleSchema({
  time: {
    type: Number,
    label: "Time",
    optional: false,
  },
  value: {
    type: Number,
    label: "Value",
    optional: false,
  },
})