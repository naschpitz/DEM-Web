import AgentsDAO from "./dao"

import Calibrations from "../../calibrations/both/class"
import Simulations from "../../simulations/both/class"
import Materials from "../../materials/both/class"
import Sceneries from "../../sceneries/both/class"

export default class Agents extends AgentsDAO {
  static create(calibrationId, number) {
    const calibration = Calibrations.findOne(calibrationId)

    // Clones the original simulation (thus, scenery and materials)
    const simulationId = Simulations.clone(calibration.owner)

    // Updates the materials for the cloned simulation's scenery
    updateMaterials(simulationId)

    const agentId = AgentsDAO.insert({
      owner: calibrationId,
      simulation: simulationId,
      number: number,
    })

    // Updates the materials coefficients with the boundaries
    function updateMaterials(simulationId) {
      const scenery = Sceneries.findOne({ owner: simulationId })
      const materials = Materials.find({ owner: scenery._id })

      const materialsBoundaries = Calibrations.getMaterialsBoundaries(calibrationId)

      materials.forEach(material => {
        const materialBoundary = materialsBoundaries.find(
          materialBoundary => materialBoundary.callSign === material.callSign
        )

        const newCoefficients = materialBoundary.coefficients.map(materialBoundary =>
          calculateCoefficient(materialBoundary, calibration.agents, i)
        )

        const newDragCoefficients = materialBoundary.dragCoefficients.map(materialBoundary =>
          calculateCoefficient(materialBoundary, calibration.agents, i)
        )

        function calculateCoefficient(materialBoundary, agents, index) {
          const width = materialBoundary.max - materialBoundary.min
          const step = width / agents

          return materialBoundary.min + step * index
        }

        Materials.updateObj({
          _id: material._id,
          coefficients: newCoefficients,
          dragCoefficients: newDragCoefficients,
        })
      })
    }

    return agentId
  }
}
