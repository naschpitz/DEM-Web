import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

export default new SimpleSchema({
  r: {
    type: Number,
    label: "Red",
    min: 0,
    max: 255,
    defaultValue: 255,
    optional: true,
  },
  g: {
    type: Number,
    label: "Green",
    min: 0,
    max: 255,
    defaultValue: 255,
    optional: true,
  },
  b: {
    type: Number,
    label: "Blue",
    min: 0,
    max: 255,
    defaultValue: 255,
    optional: true,
  },
  a: {
    type: Number,
    label: "Alpha",
    defaultValue: 1,
    optional: true,
  },
})
