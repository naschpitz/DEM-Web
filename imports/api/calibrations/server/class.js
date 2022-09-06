import CalibrationsBoth from "../both/class.js"
import DataSets from "../../dataSets/both/class"
import Materials from "../../materials/both/class"
import Simulations from "../../simulations/server/class"

export default class Calibrations extends CalibrationsBoth {
  static start(calibrationId) {
    const calibration = Calibrations.findOne(calibrationId)
    const simulation = Simulations.findOne(calibration.owner)

    initialize(simulation, calibration)

    function initialize(simulation, calibration) {
      const materials = Materials.find({ owner: simulation._id }).fetch()

      function getMaterialsBoundaries(materials, variation) {
        return materials.map(material => {
          return {
            callSign: material.callSign,
            coefficients: getMaxMin(material.coefficients, variation),
            dragCoefficients: getMaxMin(material.dragCoefficients, variation),
          }

          function getMaxMin(array, variation) {
            return array.map(value => {
              return {
                max: value * (1 + variation),
                min: value * (1 - variation),
              }
            })
          }
        })
      }

      const materialsBoundaries = getMaterialsBoundaries(materials, calibration.domain)

      const agents = []

      for (let i = 0; i < calibration.agents; i++) {
        const newSimulationId = Simulations.clone(simulation._id, calibrationId)
        const agent = Simulations.findOne(newSimulationId)

        agents.push(agent)
      }

      return agents
    }
  }

  static pause(calibrationId) {}

  static stop(calibrationId) {}

  static reset(calibrationId) {}

  static removeByOwner(simulationId) {
    const calibration = Calibrations.findOne({ owner: simulationId })

    DataSets.removeByOwner(calibration._id)
    Calibrations.remove(calibration._id)
  }
}
