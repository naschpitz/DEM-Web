import _ from "lodash"

import AgentsDAO from "./dao"

import AgentsHistories from "../../agentsHistories/both/class"
import Calibrations from "../../calibrations/both/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Parameters from "../../parameters/both/class"
import Sceneries from "../../sceneries/both/class"
import Simulations from "../../simulations/both/class"
import SolidObjects from "../../solidObjects/both/class"

export default class Agents extends AgentsDAO {
  static async create(calibrationId, index) {
    const calibration = await Calibrations.findOneAsync(calibrationId)

    // Clones the original simulation (thus, scenery and materials). The cloned simulation is not primary, as it is
    // intended to be used by the agents only.
    const currentSimulationId = await Simulations.clone(calibration.owner, false)
    await Simulations.updateObjAsync({
      _id: currentSimulationId,
      server: calibration.server,
    })

    // Updates the materials and objects for the cloned simulation's scenery
    await Agents.initializeCoefficients(calibrationId, currentSimulationId)

    // The best simulation will be a clone of the original simulation, because it has to be kept while the current
    // simulation is being constantly altered by the agent.
    const bestSimulationId = await Simulations.clone(currentSimulationId, false)

    return await AgentsDAO.insertAsync({
      owner: calibrationId,
      current: { simulation: currentSimulationId },
      best: { simulation: bestSimulationId },
      index: index,
    })
  }

  // Updates the objects coefficients with the boundaries
  static async initializeCoefficients(calibrationId, simulationId) {
    const promises = await Parameters.find({ owner: calibrationId }).mapAsync(async parameter => {
      const parameterId = parameter._id

      await Agents.updateMaterialObject(parameterId, simulationId)
    })

    await Promise.all(promises)
  }

  static async updateMaterialObject(parameterId, simulationId) {
    const parameter = await Parameters.findOneAsync(parameterId)
    const simulation = await Simulations.findOneAsync(simulationId)
    const scenery = await Sceneries.findOneAsync({ owner: simulation._id })

    switch (parameter.type) {
      case "material": {
        const originalMaterial = await Materials.findOneAsync(parameter.materialObject)
        const material = await Materials.findOneAsync({ owner: scenery._id, callSign: originalMaterial.callSign })

        const value = getValue(material, parameter)
        _.set(material, parameter.coefficient, value)

        await Materials.updateObjAsync(material)

        break
      }
      case "nonSolidObject": {
        const originalNonSolidObject = await NonSolidObjects.findOneAsync(parameter.materialObject)
        const nonSolidObject = await NonSolidObjects.findOneAsync({
          owner: scenery._id,
          callSign: originalNonSolidObject.callSign,
        })

        const value = getValue(nonSolidObject, parameter)
        _.set(nonSolidObject, parameter.coefficient, value)

        await NonSolidObjects.updateObjAsync(nonSolidObject)

        break
      }
      case "solidObject": {
        const originalSolidObject = await SolidObjects.findOneAsync(parameter.materialObject)
        const solidObject = await SolidObjects.findOneAsync({
          owner: scenery._id,
          callSign: originalSolidObject.callSign,
        })

        const value = getValue(solidObject, parameter)
        _.set(solidObject, parameter.coefficient, value)

        await SolidObjects.updateObjAsync(solidObject)

        break
      }
    }

    function getValue(materialObject, parameter) {
      const minValue = _.get(materialObject, parameter.coefficient) * (1 - parameter.variation)
      const maxValue = _.get(materialObject, parameter.coefficient) * (1 + parameter.variation)
      return minValue + (maxValue - minValue) * Math.random()
    }
  }

  static async getState(agentId) {
    const agent = await Agents.findOneAsync(agentId)
    const simulation = await Simulations.findOneAsync(agent.current.simulation)

    return simulation.state
  }

  static async getBestScores(calibrationId) {
    const agents = await Agents.find({ owner: calibrationId }).fetchAsync()

    // For each iteration, up until currentIteration, get the best global score of that iteration.
    const bestScores = []

    const numAgentsHistories = await AgentsHistories.find({ owner: agents[0]._id }).countAsync()

    for (let i = 0; i < numAgentsHistories; i++) {
      // Get the SimulationScore of the best global agent of the iteration i
      for (const agent of agents) {
        const agentHistory = await AgentsHistories.findOneAsync({ owner: agent._id, iteration: i })

        // Check if the best of the agent history is the best global.
        if (agentHistory.best.bestGlobal)
          // Push the best score of the best global agent of the iteration i
          bestScores.push(agentHistory.best.score)
      }
    }

    return bestScores
  }
}
