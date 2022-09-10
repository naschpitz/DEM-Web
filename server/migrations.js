import { Random } from "meteor/random"

import Materials from "../imports/api/materials/both/collection"
import NonSolidObjects from "../imports/api/nonSolidObjects/both/collection"
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
