import SimpleSchema from "simpl-schema"

export default Dimensions = new SimpleSchema({
  spacing: {
    type: Number,
    label: "Spacing",
    optional: true,
  },
  length: {
    type: Array,
    label: "Length",
    minCount: 1,
    maxCount: 3,
    defaultValue: [0, 0, 0],
    optional: true,
  },
  "length.$": {
    type: Number,
  },
})
