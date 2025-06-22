import { Random } from "meteor/random"

import Agents from "../imports/api/agents/both/collection"
import AgentsHistories from "../imports/api/agentsHistories/both/collection"
import Calibrations from "../imports/api/calibrations/both/collection"
import DataSets from "../imports/api/dataSets/both/collection"
import Logs from "../imports/api/logs/both/collection"
import Materials from "../imports/api/materials/both/collection"
import NonSolidObjects from "../imports/api/nonSolidObjects/both/collection"
import Simulations from "../imports/api/simulations/both/collection"
import SolidObjects from "../imports/api/solidObjects/both/collection"

Migrations.add({
  version: 1,
  name: "Add a call sign to Materials, SolidObjects and NonSolidObjects",
  up: async () => {
    const update = () => ({ $set: { callSign: Random.id() } })

    await Materials.find().forEachAsync(async material => {
      await Materials.updateAsync(material._id, update(), { validate: false, multi: true })
    })

    await SolidObjects.find().forEachAsync(async solidObject => {
      await SolidObjects.updateAsync(solidObject._id, update(), { validate: false, multi: true })
    })

    await NonSolidObjects.find().forEachAsync(async nonSolidObject => {
      await NonSolidObjects.updateAsync(nonSolidObject._id, update(), { validate: false, multi: true })
    })
  },
  down: async () => {
    const update = { $unset: { callSign: "" } }

    await Materials.updateAsync({}, update, { validate: false, multi: true })
    await SolidObjects.updateAsync({}, update, { validate: false, multi: true })
    await NonSolidObjects.updateAsync({}, update, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 2,
  name: "Add 'primary' property to Simulations",
  up: async () => {
    const update = { $set: { primary: true } }

    await Simulations.updateAsync({}, update, { validate: false, multi: true })
  },
  down: async () => {
    const update = { $unset: { primary: "" } }

    await Simulations.updateAsync({}, update, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 3,
  name: "Rename 'simulationsLogs' collection to 'log'",
  up: () => {
    Logs.rawCollection().rename("logs")
  },
  down: () => {
    Logs.rawCollection().rename("simulationsLogs")
  },
})

Migrations.add({
  version: 4,
  name: "Change DataSet to the new schema format",
  up: async () => {
    await DataSets.find({}).forEachAsync(async dataSet => {
      const newData = dataSet.data.map(data => ({
        time: data[0],
        value: data[1],
      }))

      await DataSets.updateAsync(dataSet._id, { $set: { data: newData } })
    })
  },
  down: async () => {
    await DataSets.find({}).forEachAsync(async dataSet => {
      const newData = dataSet.data.map(data => [data.time, data.value])

      await DataSets.updateAsync(dataSet._id, { $set: { data: newData } })
    })
  },
})

Migrations.add({
  version: 5,
  name: "Add 'weight' property to DataSets",
  up: async () => {
    await DataSets.updateAsync({}, { $set: { weight: 1 } }, { validate: false, multi: true })
  },
  down: async () => {
    await DataSets.updateAsync({}, { $unset: { weight: "" } }, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 6,
  name: "Add 'numIterations' and 'minPercentage' property to Calibration",
  up: async () => {
    await Calibrations.updateAsync({}, { $set: { numIterations: 3, minPercentage: 0.01 } }, { validate: false, multi: true })
  },
  down: async () => {
    await Calibrations.updateAsync({}, { $unset: { numIterations: "", minPercentage: "" } }, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 7,
  name: "Change Calibrations property name 'numIterations' to 'numIntervals'",
  up: () => {
    Calibrations.rawCollection().updateMany({}, { $rename: { numIterations: "numIntervals" } })
  },
  down: () => {
    Calibrations.rawCollection().updateMany({}, { $rename: { numIntervals: "numIterations" } })
  },
})

Migrations.add({
  version: 8,
  name: "Copy Agents' history array to the AgentsHistory collection",
  up: async () => {
    // For each Agent
    await Agents.find().forEachAsync(async agent => {
      // For each history in the Agent
      for (const history of agent.history) {
        const agentHistory = {
          owner: agent._id,
          ...history,
        }

        // Insert the history in the AgentsHistories collection
        await AgentsHistories.insertAsync(agentHistory)
      }

      // Remove the history from the Agent
      await Agents.updateAsync(agent._id, { $unset: { history: "" } })
    })
  },
  down: async () => {
    // For Each Agent
    await Agents.find().forEachAsync(async agent => {
      // Find the Agent's histories
      const agentHistories = await AgentsHistories.find({ owner: agent._id }, { sort: { iteration : 1 }}).fetchAsync()

      // Build the history array from the AgentHistories
      const history = agentHistories.map(agentHistory => {
        return {
          iteration: agentHistory.iteration,
          current: agentHistory.current,
          best: agentHistory.best,
        }
      })

      // Update the Agent with the history
      await Agents.updateAsync(agent._id, { $set: { history } })
    })

    // Remove the AgentHistories collection
    AgentsHistories.rawCollection().drop()
  }
})
