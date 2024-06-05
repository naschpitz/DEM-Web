import _ from "lodash"

import Calibrations from "../../calibrations/both/class"
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

    return {
      oldSceneryId: oldSceneryId,
      newSceneryId: newSceneryId,
      materialsMap: materialsMap,
      nonSolidObjectsMap: nonSolidObjectsMap,
      solidObjectsMap: solidObjectsMap,
    }
  }

  static create(simulationId) {
    const sceneryId = SceneriesDAO.insert({ owner: simulationId })
    Cameras.create(sceneryId)

    return sceneryId
  }

  static getMap(oldSceneryId, newSceneryId) {
    const materialsMap = {}

    Materials.find({ owner: oldSceneryId }).forEach(oldMaterial => {
      materialsMap[oldMaterial._id] = Materials.findOne({ owner: newSceneryId, callSign: oldMaterial.callSign })._id
    })

    const nonSolidObjectsMap = {}

    NonSolidObjects.find({ owner: oldSceneryId }).forEach(oldNSO => {
      nonSolidObjectsMap[oldNSO._id] = NonSolidObjects.findOne({ owner: newSceneryId, callSign: oldNSO.callSign })._id
    })

    const solidObjectsMap = {}

    SolidObjects.find({ owner: oldSceneryId }).forEach(oldSO => {
      solidObjectsMap[oldSO._id] = SolidObjects.findOne({ owner: newSceneryId, callSign: oldSO.callSign })._id
    })

    return {
      materialsMap: materialsMap,
      nonSolidObjectsMap: nonSolidObjectsMap,
      solidObjectsMap: solidObjectsMap,
    }
  }

  static findByCalibration(calibrationId) {
    const calibration = Calibrations.findOne(calibrationId)
    if (!calibration) throw { code: "404", message: "Calibration not found" }

    const simulationId = calibration.owner

    return SceneriesDAO.findOne({ owner: simulationId })
  }
}
