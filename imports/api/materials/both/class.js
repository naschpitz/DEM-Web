import { Random } from "meteor/random"
import _ from "lodash"

import MaterialsDAO from "./dao"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Parameters from "../../parameters/both/class"
import Sceneries from "../../sceneries/both/class"
import SolidObjects from "../../solidObjects/both/class"

export default class Materials extends MaterialsDAO {
  static async clone(oldSceneryId, newSceneryId) {
    const oldMaterials = MaterialsDAO.find({ owner: oldSceneryId })

    const materialsMap = new Map()

    oldMaterials.forEach(oldMaterial => {
      const oldMaterialId = oldMaterial._id
      const newMaterialId = Random.id()

      materialsMap[oldMaterialId] = newMaterialId
    })

    for (const oldMaterial of oldMaterials) {
      const newMaterial = _.clone(oldMaterial)
      newMaterial._id = materialsMap[oldMaterial._id]
      newMaterial.owner = newSceneryId
      newMaterial.material1 = materialsMap[oldMaterial.material1]
      newMaterial.material2 = materialsMap[oldMaterial.material2]

      await MaterialsDAO.insertAsync(newMaterial)
    }

    return materialsMap
  }

  static async create(owner) {
    return await MaterialsDAO.insertAsync({ owner: owner })
  }

  static async usesMaterial(materialId) {
    const materialFound = await MaterialsDAO.findOneAsync({ $or: [{ material1: materialId }, { material2: materialId }] })

    return !!materialFound
  }

  static async removeAsync(materialId) {
    const nsoResult = await NonSolidObjects.usesMaterial(materialId)
    if (nsoResult) throw { message: "Cannot remove material, a Non-Solid Object makes reference to it." }

    const soResult = await SolidObjects.usesMaterial(materialId)
    if (soResult) throw { message: "Cannot remove material, a Solid Object makes reference to it." }

    const parameterResult = await Parameters.usesMaterialObject(materialId)
    if (parameterResult) throw { message: "Cannot remove material, a Parameter makes reference to it." }

    const materialResult = await this.usesMaterial(materialId)
    if (materialResult) throw { message: "Cannot remove material, another Material makes reference to it." }

    await MaterialsDAO.removeAsync(materialId)
  }

  static async removeByOwner(sceneryId) {
    await MaterialsDAO.removeAsync({ owner: sceneryId })
  }

  static async getByCalibration(calibrationId) {
    const scenery = await Sceneries.findByCalibration(calibrationId)
    if (!scenery) throw { code: "404", message: "Scenery not found" }

    const sceneryId = scenery._id
    return await Materials.find({ owner: sceneryId }).fetchAsync()
  }
}
