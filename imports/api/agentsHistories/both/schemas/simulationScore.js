import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

import DataSetEvaluation from "./dataSetEvaluation"

export default new SimpleSchema({
  score: {
    type: Number,
    label: "Score Value",
    defaultValue: 0,
    optional: true,
  },
  bestGlobal: {
    type: Boolean,
    label: "Best Global",
    defaultValue: false,
    optional: true,
  },
  valid: {
    type: Boolean,
    label: "Valid",
    defaultValue: false,
    optional: true,
  },
  simulation: {
    type: String,
    label: "Simulation Id",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  dataSetsEvaluations: {
    type: Array,
    label: "Data Sets Evaluations",
    defaultValue: [],
    optional: true,
  },
  "dataSetsEvaluations.$": {
    type: DataSetEvaluation,
  },
})
