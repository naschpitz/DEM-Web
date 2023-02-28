import SimpleSchema from "simpl-schema"

import SimulationScore from "./simulationScore"

export default History = new SimpleSchema({
  iteration: {
    type: Number,
    label: "Iteration",
    defaultValue: 0,
    optional: true,
  },
  current: {
    type: SimulationScore,
    label: "Current",
    optional: false,
  },
  best: {
    type: SimulationScore,
    label: "Best",
    optional: true,
  },
})
