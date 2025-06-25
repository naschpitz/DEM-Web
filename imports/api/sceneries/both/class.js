import _ from "lodash"

import Calibrations from "../../calibrations/both/class"
import Cameras from "../../cameras/both/class.js"
import CameraFilters from "../../cameraFilters/both/class.js"
import Frames from "../../frames/both/class"
import Materials from "../../materials/both/class.js"
import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import SceneriesDAO from "./dao.js"
import SolidObjects from "../../solidObjects/both/class.js"

export default class Sceneries extends SceneriesDAO {
  static async clone(oldSimulationId, newSimulationId, frames = false) {
    const oldScenery = await SceneriesDAO.findOneAsync({ owner: oldSimulationId })

    const newScenery = _.cloneDeep(oldScenery)
    delete newScenery._id
    newScenery.owner = newSimulationId

    const oldSceneryId = oldScenery._id
    const newSceneryId = await SceneriesDAO.insertAsync(newScenery)

    await Cameras.clone(oldSceneryId, newSceneryId)
    await CameraFilters.clone(oldSceneryId, newSceneryId)

    const materialsMap = await Materials.clone(oldSceneryId, newSceneryId)
    const nonSolidObjectsMap = await NonSolidObjects.clone(oldSceneryId, newSceneryId, materialsMap)
    const solidObjectsMap = await SolidObjects.clone(oldSceneryId, newSceneryId, materialsMap)

    if (frames) {
      await Frames.clone(oldSceneryId, newSceneryId, nonSolidObjectsMap, solidObjectsMap)
    }

    return {
      oldSceneryId: oldSceneryId,
      newSceneryId: newSceneryId,
      materialsMap: materialsMap,
      nonSolidObjectsMap: nonSolidObjectsMap,
      solidObjectsMap: solidObjectsMap,
    }
  }

  static async create(simulationId) {
    const sceneryId = await SceneriesDAO.insertAsync({ owner: simulationId })
    await Cameras.create(sceneryId)

    return sceneryId
  }

  static async getMap(oldSceneryId, newSceneryId) {
    const materialsMap = {}
    const materialsPromises = await Materials.find({ owner: oldSceneryId }).mapAsync(async oldMaterial => {
      materialsMap[oldMaterial._id] = (
        await Materials.findOneAsync({ owner: newSceneryId, callSign: oldMaterial.callSign })
      )._id
    })

    const nonSolidObjectsMap = {}
    const nonSolidObjectsPromises = await NonSolidObjects.find({ owner: oldSceneryId }).mapAsync(async oldNSO => {
      nonSolidObjectsMap[oldNSO._id] = (
        await NonSolidObjects.findOneAsync({ owner: newSceneryId, callSign: oldNSO.callSign })
      )._id
    })

    const solidObjectsMap = {}
    const solidObjectsPromises = await SolidObjects.find({ owner: oldSceneryId }).mapAsync(async oldSO => {
      solidObjectsMap[oldSO._id] = (
        await SolidObjects.findOneAsync({ owner: newSceneryId, callSign: oldSO.callSign })
      )._id
    })

    await Promise.all(materialsPromises)
    await Promise.all(nonSolidObjectsPromises)
    await Promise.all(solidObjectsPromises)

    return {
      materialsMap: materialsMap,
      nonSolidObjectsMap: nonSolidObjectsMap,
      solidObjectsMap: solidObjectsMap,
    }
  }

  static async findByCalibration(calibrationId) {
    const calibration = await Calibrations.findOneAsync(calibrationId)
    if (!calibration) throw { code: "404", message: "Calibration not found" }

    const simulationId = calibration.owner

    return await SceneriesDAO.findOneAsync({ owner: simulationId })
  }
}
