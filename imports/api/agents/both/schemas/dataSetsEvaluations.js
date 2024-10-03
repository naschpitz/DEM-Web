import 'meteor/aldeed:collection2/static'
import SimpleSchema from 'meteor/aldeed:simple-schema'

import Data from "./data.js"

export default DataSetEvaluation = new SimpleSchema({
  dataSet: {
    type: String,
    label: "Object",
    regEx: SimpleSchema.RegEx.Id,
    optional: false,
    custom: function () {
      if ((this.isUpdate || this.isUpsert) && !this.isSet) {
        return "missingField"
      }
    },
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
    type: Data
  },
})