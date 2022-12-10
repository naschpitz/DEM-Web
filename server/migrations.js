import { Random } from "meteor/random"

import Calibrations from "/imports/api/calibrations/both/collection"
import DataSets from "../imports/api/dataSets/both/collection"
import Logs from "../imports/api/logs/both/collection"
import Materials from "../imports/api/materials/both/collection"
import NonSolidObjects from "../imports/api/nonSolidObjects/both/collection"
import Sceneries from "../imports/api/sceneries/both/collection"
import Simulations from "../imports/api/simulations/both/collection"
import SolidObjects from "../imports/api/solidObjects/both/collection"

Migrations.add({
  version: 1,
  name: "Add a call sign to Materials, SolidObjects and NonSolidObjects",
  up: () => {
    const update = () => ({ $set: { callSign: Random.id() } })

    Materials.find().forEach(material => {
      Materials.update(material._id, update(), { validate: false })
    })

    SolidObjects.find().forEach(solidObject => {
      SolidObjects.update(solidObject._id, update(), { validate: false })
    })

    NonSolidObjects.find().forEach(nonSolidObject => {
      NonSolidObjects.update(nonSolidObject._id, update(), { validate: false })
    })
  },
  down: () => {
    const update = { $unset: { callSign: "" } }

    Materials.update({}, update, { validate: false })
    SolidObjects.update({}, update, { validate: false })
    NonSolidObjects.update({}, update, { validate: false })
  },
})

Migrations.add({
  version: 2,
  name: "Add 'primary' property to Simulations",
  up: () => {
    const update = { $set: { primary: true } }

    Simulations.update({}, update, { validate: false })
  },
  down: () => {
    const update = { $unset: { primary: "" } }

    Simulations.update({}, update, { validate: false })
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
  version: 5,
  name: "Change DataSet to the new schema format",
  up: () => {
    DataSets.find({}).forEach(dataSet => {
      const newData = dataSet.data.map(data => ({
        time: data[0],
        value: data[1],
      }))

      const object = NonSolidObjects.findOne(dataSet.object)?.callSign || SolidObjects.findOne(dataSet.object)?.callSign

      DataSets.update(dataSet._id, { $set: { object: object, data: newData } })
    })
  },
  down: () => {
    DataSets.find({}).forEach(dataSet => {
      const newData = dataSet.data.map(data => [data.time, data.value])

      const calibration = Calibrations.findOne(dataSet.owner)
      const simulation = Simulations.findOne(calibration.owner)
      const scenery = Sceneries.findOne({ owner: simulation._id })

      const nonSolidObjectId = NonSolidObjects.findOne({ owner: scenery._id, callSign: dataSet.object })?._id
      const solidObjectId = SolidObjects.findOne({ owner: scenery._id, callSign: dataSet.object })?._id

      const object = nonSolidObjectId || solidObjectId

      DataSets.update(dataSet._id, { $set: { object: object, data: newData } })
    })
  },
})
