import _ from "lodash"

import AgentsDAO from "./dao"

import Calibrations from "../../calibrations/both/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Parameters from "../../parameters/both/class"
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

    // Updates the materials and objects for the cloned simulation's scenery
    initializeCoefficients(calibrationId, currentSimulationId)

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
    function initializeCoefficients(calibrationId, simulationId) {
      Parameters.find({ owner: calibrationId }).forEach(parameter => {
        const parameterId = parameter._id

        Agents.updateMaterialObject(parameterId, simulationId)
      })
    }
  }

  static updateMaterialObject(parameterId, simulationId) {
    const parameter = Parameters.findOne(parameterId)
    const simulation = Simulations.findOne(simulationId)
    const scenery = Sceneries.findOne({ owner: simulation._id })

    switch (parameter.type) {
      case "material": {
        const originalMaterial = Materials.findOne(parameter.materialObject)
        const material = Materials.findOne({ owner: scenery._id, callSign: originalMaterial.callSign })

        const value = getValue(material, parameter)
        _.set(material, parameter.coefficient, value)

        Materials.updateObj(material)

        break
      }
      case "nonSolidObject": {
        const originalNonSolidObject = NonSolidObjects.findOne(parameter.materialObject)
        const nonSolidObject = NonSolidObjects.findOne({
          owner: scenery._id,
          callSign: originalNonSolidObject.callSign,
        })

        const value = getValue(nonSolidObject, parameter)
        _.set(nonSolidObject, parameter.coefficient, value)

        NonSolidObjects.updateObj(nonSolidObject)

        break
      }
      case "solidObject": {
        const originalSolidObject = SolidObjects.findOne(parameter.materialObject)
        const solidObject = SolidObjects.findOne({ owner: scenery._id, callSign: originalSolidObject.callSign })

        const value = getValue(solidObject, parameter)
        _.set(solidObject, parameter.coefficient, value)

        SolidObjects.updateObj(solidObject)

        break
      }
    }

    function getValue(materialObject, parameter) {
      const minValue = _.get(materialObject, parameter.coefficient) * (1 + parameter.variation)
      const maxValue = _.get(materialObject, parameter.coefficient) * (1 - parameter.variation)
      return minValue + (maxValue - minValue) * Math.random()
    }
  }

  static getState(agentId) {
    const agent = Agents.findOne(agentId)
    const simulation = Simulations.findOne(agent.current.simulation)

    return simulation.state
  }
}
