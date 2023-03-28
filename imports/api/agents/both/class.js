import AgentsDAO from "./dao"

import Calibrations from "../../calibrations/both/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Sceneries from "../../sceneries/both/class"
import Simulations from "../../simulations/both/class"
import SolidObjects from "../../solidObjects/both/class"

export default class Agents extends AgentsDAO {
  static create(calibrationId, index) {
    const calibration = Calibrations.findOne(calibrationId)

    // Clones the original simulation (thus, scenery and materials). The cloned simulation is not primary, as it is
    // intended to be used by the agents only.
    const currentSimulationId = Simulations.clone(calibration.owner, false)
    Simulations.updateObj({
      _id: currentSimulationId,
      server: calibration.server,
    })

    // Updates the objects for the cloned simulation's scenery
    initializeObjects(currentSimulationId, calibrationId)

    // Updates the materials for the cloned simulation's scenery
    initializeMaterials(currentSimulationId, calibrationId)

    // The best simulation will be a clone of the original simulation, because it has to be kept while the current
    // simulation is being constantly altered by the agent.
    const bestSimulationId = Simulations.clone(currentSimulationId, false)

    return AgentsDAO.insert({
      owner: calibrationId,
      current: { simulation: currentSimulationId },
      best: { simulation: bestSimulationId },
      index: index,
    })

    // Updates the objects coefficients with the boundaries
    function initializeObjects(simulationId, calibrationId) {
      const calibration = Calibrations.findOne(calibrationId)

      const variation = calibration.variation

      const scenery = Sceneries.findOne({ owner: simulationId })
      const solidObjects = SolidObjects.find({ owner: scenery._id, fixed: false })
      const nonSolidObjects = NonSolidObjects.find({ owner: scenery._id, fixed: false })

      solidObjects.forEach(solidObject => {
        const minMass = solidObject.mass * (1 + variation)
        const maxMass = solidObject.mass * (1 - variation)
        const mass = minMass + (maxMass - minMass) * Math.random()

        SolidObjects.updateObj({ _id: solidObject._id, mass: mass })
      })

      nonSolidObjects.forEach(nonSolidObject => {
        const minDensity = nonSolidObject.density * (1 - variation)
        const maxDensity = nonSolidObject.density * (1 + variation)

        const density = minDensity + (maxDensity - minDensity) * Math.random()

        NonSolidObjects.updateObj({ _id: nonSolidObject._id, density: density })
      })
    }

    // Updates the materials coefficients with the boundaries
    function initializeMaterials(simulationId, calibrationId) {
      const calibration = Calibrations.findOne(calibrationId)

      const variation = calibration.variation

      const scenery = Sceneries.findOne({ owner: simulationId })
      const materials = Materials.find({ owner: scenery._id })

      const materialsBoundaries = Sceneries.getMaterialsBoundaries(scenery._id, variation)

      materials.forEach(material => {
        const materialBoundary = materialsBoundaries.find(
          materialBoundary => materialBoundary.callSign === material.callSign
        )

        const newCoefficients = materialBoundary.coefficients?.map(materialBoundary =>
          calculateCoefficient(materialBoundary)
        )

        const newDragCoefficients = materialBoundary.dragCoefficients?.map(materialBoundary =>
          calculateCoefficient(materialBoundary)
        )

        function calculateCoefficient(materialBoundary) {
          const width = materialBoundary.max - materialBoundary.min

          return materialBoundary.min + width * Math.random()
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
    const simulation = Simulations.findOne(agent.current.simulation)

    return simulation.state
  }
}
