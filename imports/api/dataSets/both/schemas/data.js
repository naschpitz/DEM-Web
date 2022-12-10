import SimpleSchema from "simpl-schema"

export default NonSolidObject = new SimpleSchema({
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