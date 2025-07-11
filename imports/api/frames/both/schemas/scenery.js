import "meteor/aldeed:collection2/static"
import SimpleSchema from "meteor/aldeed:simple-schema"

import Objects from "./objects"

export default new SimpleSchema({
  objects: {
    type: Objects,
    label: "Objects",
    optional: true,
  },
})
