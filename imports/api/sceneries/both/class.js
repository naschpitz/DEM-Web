import _ from "lodash"

import Cameras from "../../cameras/both/class.js"
import Frames from "../../frames/both/class"
import Materials from "../../materials/both/class.js"
import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import SceneriesDAO from "./dao.js"
import SolidObjects from "../../solidObjects/both/class.js"

export default class Sceneries extends SceneriesDAO {
  static clone(oldSimulationId, newSimulationId, frames = false) {
    const oldScenery = SceneriesDAO.findOne({ owner: oldSimulationId })

    const newScenery = _.cloneDeep(oldScenery)
    delete newScenery._id
    newScenery.owner = newSimulationId

    const oldSceneryId = oldScenery._id
    const newSceneryId = SceneriesDAO.insert(newScenery)

    Cameras.clone(oldSceneryId, newSceneryId)

    const materialsMap = Materials.clone(oldSceneryId, newSceneryId)
    const nonSolidObjectsMap = NonSolidObjects.clone(oldSceneryId, newSceneryId, materialsMap)
    const solidObjectsMap = SolidObjects.clone(oldSceneryId, newSceneryId, materialsMap)

    if (frames) {
      Frames.clone(oldSceneryId, newSceneryId, nonSolidObjectsMap, solidObjectsMap)
    }

    return newSceneryId
  }

  static create(simulationId) {
    const sceneryId = SceneriesDAO.insert({ owner: simulationId })
    Cameras.create(sceneryId)

    return sceneryId
  }

  static getMaterialsBoundaries(sceneryId, variation) {
    const materialsIds = Materials.find({ owner: sceneryId }, { fields: { _id: 1 } })

    return materialsIds.map(materialId => Materials.getBoundaries(materialId, variation))
  }
}
