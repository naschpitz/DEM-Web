import SimpleSchema from "simpl-schema"

import Objects from "./objects.js"

export default Scenery = new SimpleSchema({
  objects: {
    type: Objects,
    label: "Objects",
    optional: true,
  },
})
