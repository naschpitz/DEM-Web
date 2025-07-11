import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

import NonSolidObject from "./nonSolidObject"
import SolidObject from "./solidObject"

export default new SimpleSchema({
  nonSolidObjects: {
    type: Array,
    label: "Non-Solid Objects",
    optional: true,
  },
  "nonSolidObjects.$": {
    type: NonSolidObject,
    label: "Non-Solid Object",
  },
  solidObjects: {
    type: Array,
    label: "Solid Objects",
    optional: true,
  },
  "solidObjects.$": {
    type: SolidObject,
    label: "Solid Object",
  },
})
