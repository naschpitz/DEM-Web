import AgentsDAO from "./dao"

import Calibrations from "../../calibrations/both/class"
import Simulations from "../../simulations/both/class"
import Materials from "../../materials/both/class"
import Sceneries from "../../sceneries/both/class"

export default class Agents extends AgentsDAO {
  static create(calibrationId, index) {
    const calibration = Calibrations.findOne(calibrationId)

    // Clones the original simulation (thus, scenery and materials). The cloned simulation is not primary, as it is
    // intended to be used by the agents only.
    const simulationId = Simulations.clone(calibration.owner, false)
    Simulations.updateObj({ _id: simulationId, server: calibration.server })

    // Updates the materials for the cloned simulation's scenery
    initializeMaterials(simulationId, calibrationId, index)

    return AgentsDAO.insert({
      owner: calibrationId,
      simulation: simulationId,
      index: index,
    })

    // Updates the materials coefficients with the boundaries
    function initializeMaterials(simulationId, calibrationId, index) {
      const calibration = Calibrations.findOne(calibrationId)

      const variation = calibration.variation
      const agentsNumber = calibration.agentsNumber

      const scenery = Sceneries.findOne({ owner: simulationId })
      const materials = Materials.find({ owner: scenery._id })

      const materialsBoundaries = Sceneries.getMaterialsBoundaries(scenery._id, variation)

      materials.forEach(material => {
        const materialBoundary = materialsBoundaries.find(
          materialBoundary => materialBoundary.callSign === material.callSign
        )

        const newCoefficients = materialBoundary.coefficients.map(materialBoundary =>
          calculateCoefficient(materialBoundary, agentsNumber, index)
        )

        const newDragCoefficients = materialBoundary.dragCoefficients.map(materialBoundary =>
          calculateCoefficient(materialBoundary, agentsNumber, index)
        )

        function calculateCoefficient(materialBoundary, elementsNumber, index) {
          const width = materialBoundary.max - materialBoundary.min
          const step = width / elementsNumber

          return materialBoundary.min + step * index
        }

        Materials.updateObj({
          _id: material._id,
          coefficients: newCoefficients,
          dragCoefficients: newDragCoefficients,
        })
      })
    }
  }

  static getState(agentId) {
    const agent = Agents.findOne(agentId)
    const simulation = Simulations.findOne(agent.simulation)

    return simulation.state
  }
}
