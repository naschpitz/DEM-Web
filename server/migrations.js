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
  up: () => {
    const update = () => ({ $set: { callSign: Random.id() } })

    Materials.find().forEach(material => {
      Materials.update(material._id, update(), { validate: false, multi: true })
    })

    SolidObjects.find().forEach(solidObject => {
      SolidObjects.update(solidObject._id, update(), { validate: false, multi: true })
    })

    NonSolidObjects.find().forEach(nonSolidObject => {
      NonSolidObjects.update(nonSolidObject._id, update(), { validate: false, multi: true })
    })
  },
  down: () => {
    const update = { $unset: { callSign: "" } }

    Materials.update({}, update, { validate: false, multi: true })
    SolidObjects.update({}, update, { validate: false, multi: true })
    NonSolidObjects.update({}, update, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 2,
  name: "Add 'primary' property to Simulations",
  up: () => {
    const update = { $set: { primary: true } }

    Simulations.update({}, update, { validate: false, multi: true })
  },
  down: () => {
    const update = { $unset: { primary: "" } }

    Simulations.update({}, update, { validate: false, multi: true })
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
  up: () => {
    DataSets.find({}).forEach(dataSet => {
      const newData = dataSet.data.map(data => ({
        time: data[0],
        value: data[1],
      }))

      DataSets.update(dataSet._id, { $set: { data: newData } })
    })
  },
  down: () => {
    DataSets.find({}).forEach(dataSet => {
      const newData = dataSet.data.map(data => [data.time, data.value])

      DataSets.update(dataSet._id, { $set: { data: newData } })
    })
  },
})

Migrations.add({
  version: 5,
  name: "Add 'weight' property to DataSets",
  up: () => {
    DataSets.update({}, { $set: { weight: 1 } }, { validate: false, multi: true })
  },
  down: () => {
    DataSets.update({}, { $unset: { weight: "" } }, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 6,
  name: "Add 'numIterations' and 'minPercentage' property to Calibration",
  up: () => {
    Calibrations.update({}, { $set: { numIterations: 3, minPercentage: 0.01 } }, { validate: false, multi: true })
  },
  down: () => {
    Calibrations.update({}, { $unset: { numIterations: "", minPercentage: "" } }, { validate: false, multi: true })
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
  up: () => {
    // For each Agent
    Agents.find().forEach(agent => {
      // For each history in the Agent
      agent.history.forEach(history => {
        const agentHistory = {
          owner: agent._id,
          ...history,
        }

        // Insert the history in the AgentsHistories collection
        AgentsHistories.insertAsync(agentHistory)
      })

      // Remove the history from the Agent
      Agents.update(agent._id, { $unset: { history: "" } })
    })
  },
  down: () => {
    // For Each Agent
    Agents.find().forEach(agent => {
      // Find the Agent's histories
      const agentHistories = AgentsHistories.find({ owner: agent._id }, { sort: { iteration : 1 }})

      // Build the history array from the AgentHistories
      const history = agentHistories.map(agentHistory => {
        return {
          iteration: agentHistory.iteration,
          current: agentHistory.current,
          best: agentHistory.best,
        }
      })

      // Update the Agent with the history
      Agents.update(agent._id, { $set: { history } })
    })

    // Remove the AgentHistories collection
    AgentsHistories.rawCollection().drop()
  }
})
