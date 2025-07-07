import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

import Data from "../../../agents/both/schemas/data"

export default new SimpleSchema({
  dataSet: {
    type: String,
    label: "Data Set Id",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
  },
  score: {
    type: Number,
    label: "Score",
    optional: false,
  },
  referenceData: {
    type: Array,
    label: "Reference Data",
    optional: false,
  },
  "referenceData.$": {
    type: Data,
  },
  simulationData: {
    type: Array,
    label: "Simulation Data",
    optional: false,
  },
  "simulationData.$": {
    type: Data,
  },
  errorData: {
    type: Array,
    label: "Error Data",
    optional: false,
  },
  "errorData.$": {
    type: Data,
  },
})
