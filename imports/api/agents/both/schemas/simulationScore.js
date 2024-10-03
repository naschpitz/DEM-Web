import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

import DataSetsEvaluations from "./dataSetsEvaluations"

export default SimulationScore = new SimpleSchema({
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
  dataSetEvaluations: {
    type: Array,
    label: "DataSet Evaluations",
    optional: true,
  },
  "dataSetsEvaluations.$": {
    type: DataSetsEvaluations,
  },
})
