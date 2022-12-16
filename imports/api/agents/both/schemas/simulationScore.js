import SimpleSchema from "simpl-schema"

export default Best = new SimpleSchema({
  score: {
    type: Number,
    label: "Score Value",
    defaultValue: 0,
    optional: true,
  },
  simulation: {
    type: String,
    label: "Simulation Id",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
})
