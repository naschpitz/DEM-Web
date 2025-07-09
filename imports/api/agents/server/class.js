import Spline from "cubic-spline"
import _ from "lodash"

import AgentsBoth from "../both/class"
import AgentsHistories from "../../agentsHistories/both/class"
import DataSets from "../../dataSets/both/class"
import Frames from "../../frames/server/class"
import Materials from "../../materials/both/class"
import NonSolidObjects from "../../nonSolidObjects/both/class"
import Parameters from "../../parameters/both/class"
import Sceneries from "../../sceneries/server/class"
import Simulations from "../../simulations/server/class"
import SolidObjects from "../../solidObjects/both/class"

export default class Agents extends AgentsBoth {
  static async start(agentId) {
    const agent = await Agents.findOneAsync(agentId)

    await Simulations.start(agent.current.simulation)
  }

  static async pause(agentId) {
    const agent = await AgentsBoth.findOneAsync(agentId)

    await Simulations.pause(agent.current.simulation)
  }

  static async stop(agentId) {
    const agent = await AgentsBoth.findOneAsync(agentId)

    await Simulations.stop(agent.current.simulation)
  }

  static async reset(agentId) {
    const agent = await AgentsBoth.findOneAsync(agentId)

    await AgentsBoth.updateObjAsync({ _id: agentId, iteration: 0 })
    await Simulations.reset(agent.current.simulation)
  }

  static async retry(agentId) {
    const agent = await AgentsBoth.findOneAsync(agentId)

    await Simulations.reset(agent.current.simulation)
    await Simulations.start(agent.current.simulation)
  }

  static async removeByOwner(owner) {
    const agents = await AgentsBoth.find({ owner: owner }).fetchAsync()

    const agentsPromises = agents.map(async agent => {
      await Simulations.removeAsync(agent.current.simulation)
      await Simulations.removeAsync(agent.best.simulation)

      const agentsHistories = await AgentsHistories.find({ owner: agent._id }).fetchAsync()

      const agentsHistoriesPromises = agentsHistories.map(async agentHistory => {
        await Simulations.removeAsync(agentHistory.current.simulation)
        await Simulations.removeAsync(agentHistory.best.simulation)
      })

      await Promise.allSettled(agentsHistoriesPromises)

      await AgentsHistories.removeByOwner(agent._id)
    })

    await Promise.allSettled(agentsPromises)

    const agentIds = agents.map(agent => agent._id)
    await AgentsBoth.removeAsync({ _id: { $in: agentIds } })
  }

  static async setBestGlobal(agentId) {
    // Get this agent based on the 'agentId'
    const agent = await AgentsBoth.findOneAsync(agentId)

    // Get the other agents with the same 'agent.owner' and set their 'bestGlobal' to false
    await AgentsBoth.updateAsync({ owner: agent.owner }, { $set: { "best.bestGlobal": false } }, { multi: true })

    await AgentsBoth.updateObjAsync({ _id: agentId, "best.bestGlobal": true })
  }

  static async getBestGlobal(calibrationId) {
    return await AgentsBoth.findOneAsync({ owner: calibrationId, "best.bestGlobal": true })
  }

  static async saveAllAgentsHistories(calibrationId) {
    const agents = await AgentsBoth.find({ owner: calibrationId }).fetchAsync()

    const saveAgentsHistoryPromises = agents.map(agent => Agents.saveAgentHistory(agent._id))
    await Promise.all(saveAgentsHistoryPromises)
  }

  static async saveAgentHistory(agentId) {
    const agent = await AgentsBoth.findOneAsync(agentId)

    const best = { ...agent.best }
    best.simulation = await Simulations.clone(agent.best.simulation, false, true, true)

    const current = { ...agent.current }
    current.simulation = await Simulations.clone(agent.current.simulation, false, true, true)

    const agentHistory = {
      owner: agentId,
      iteration: agent.iteration,
      best: best,
      current: current,
    }

    await AgentsHistories.insertAsync(agentHistory)
  }

  static async observeAsync(agentId, callback) {
    const agent = await AgentsBoth.findOneAsync(agentId)

    const agentObserve = await AgentsBoth.find({ _id: agentId }).observeAsync({
      changed: (agentNew, agentOld) => callback("agent", agentId, agentNew, agentOld),
    })

    const simulationObserve = await Simulations.find({ _id: agent.current.simulation }).observeAsync({
      changed: (simulationNew, simulationOld) => callback("simulation", agentId, simulationNew, simulationOld),
    })

    const simulation = await Simulations.findOneAsync(agent.current.simulation)
    const scenery = await Sceneries.findOneAsync({ owner: simulation._id })

    const frameObserve = await Frames.find({ owner: scenery._id }).observeAsync({
      added: frame => callback("frame", agentId, frame),
    })

    return {
      agentObserve: agentObserve,
      frameObserve: frameObserve,
      simulationObserve: simulationObserve,
      stop() {
        agentObserve.stop()
        frameObserve.stop()
        simulationObserve.stop()
      },
    }
  }

  static async updateAllScores(calibrationId) {
    const agents = await AgentsBoth.find({ owner: calibrationId }).fetchAsync()

    const scoresPromises = agents.map(agent => updateScores(agent._id))
    await Promise.all(scoresPromises)

    await Agents.updateBestGlobal(calibrationId)

    async function updateScores(agentId) {
      await updateCurrentScore(agentId)
      await updateBestScore(agentId)
    }

    async function updateCurrentScore(agentId) {
      const state = await Agents.getState(agentId)

      if (state !== "done") {
        await Agents.updateObjAsync({ _id: agentId, current: { valid: false } })
        return
      }

      const agent = await Agents.findOneAsync(agentId)
      const simulation = await Simulations.findOneAsync(agent.current.simulation)
      const scenery = await Sceneries.findOneAsync({ owner: simulation._id })

      const frames = await Frames.find({ owner: scenery._id }, { sort: { step: 1 } }).fetchAsync()
      const dataSets = await DataSets.find({ owner: agent.owner, enabled: true }).fetchAsync()

      // Sanity check: calculate the expected number of frames for the scenery.
      // The expected number of frames is the total time of the simulation divided by the frame time, rounded to the
      // nearest integer, plus 1. Plus 1 because the first frame is at time 0.
      const expectedFrames = Math.round(simulation.totalTime / simulation.frameTime) + 1

      // If the number of frames is different from the expected number of frames, then the current simulation is not
      // valid. This will prevent the agent from being considered for the best global agent, as its score will be 0,
      // since there are no frames to evaluate.
      if (frames.length !== expectedFrames) {
        await Agents.updateObjAsync({ _id: agentId, current: { valid: false } })
        return
      }

      const dataSetsEvaluations = []
      let currentScore = 0

      for (const dataSet of dataSets) {
        const objectId = dataSet.object
        const object = (await NonSolidObjects.findOneAsync(objectId)) || (await SolidObjects.findOneAsync(objectId))

        const objectCallSign = object.callSign
        const dataName = dataSet.dataName

        const spline = new Spline(
          dataSet.data.map(data => data.time),
          dataSet.data.map(data => data.value)
        )

        const minTime = dataSet.data[0].time
        const maxTime = dataSet.data[dataSet.data.length - 1].time

        const hasCondition = dataSet.startCondition && dataSet.startThreshold
        let conditionMet = false

        let startedAt = 0
        let numFrames = 0

        const referenceData = []
        const simulationData = []
        const errorData = []

        let dataSetScore = 0

        for (const frame of frames) {
          // Get the non-solid or solid object that belongs to the Frame's Scenery and has the same callSign as the DataSet's
          const nonSolidObject = await NonSolidObjects.findOneAsync({ owner: frame.owner, callSign: objectCallSign })
          const solidObject = await SolidObjects.findOneAsync({ owner: frame.owner, callSign: objectCallSign })

          const object = nonSolidObject || solidObject

          // Find in the frame object's list the one that matches the id of the object found above
          const frameNonSolidObject = _.find(frame.scenery.objects.nonSolidObjects, { _id: object._id })
          const frameSolidObject = _.find(frame.scenery.objects.solidObjects, { _id: object._id })

          const frameObject = frameNonSolidObject || frameSolidObject

          // Get the value of the dataName in the frame object
          const value = _.get(frameObject, dataName)

          if (hasCondition) {
            const startConditionMet = assessStartCondition(dataSet.startCondition, dataSet.startThreshold, value)

            // If the start condition is met and the condition is not met, then the startAt is set to the current frame time.
            if (startConditionMet && !conditionMet) {
              startedAt = frame.time
              conditionMet = true
            }
          }

          // If the start condition is not met, then the score is 0, do not add the frame to the evaluation
          if (hasCondition && !conditionMet) continue

          // The current time is the frame time minus the startAt time.
          const currentTime = frame.time - startedAt

          // If the time of the frame is not between the minTime and the maxTime of the DataSet, then do not add the frame
          // to the evaluation
          if (currentTime < minTime || currentTime > maxTime) continue

          // Evaluate the spline at the current time to get the reference value.
          const refValue = spline.at(currentTime)

          // The error is calculated as the squared difference between the simulation value and the reference value.
          // This penalizes larger absolute differences more heavily than smaller ones.
          const error = (value - refValue) ** 2

          // Increment the number of evaluated frames
          numFrames++

          const weightedError = error * dataSet.weight

          // Add the reference value to referenceData arrays, the value to the simulationData array and the error to the
          // errorData array.
          referenceData.push({ time: currentTime, value: refValue })
          simulationData.push({ time: currentTime, value: value })
          errorData.push({ time: currentTime, value: weightedError })

          // Divide the score by the number of evaluated frames, to get an error number that is not dependent on the
          // number of frames used to evaluate it.
          dataSetScore += weightedError
        }

        // Calculate the score of the dataSet by dividing the dataSetScore by the number of frames
        const proportionalScore = numFrames ? dataSetScore / numFrames : 0

        // Add the dataSetEvaluations object to the dataSetsEvaluations array
        dataSetsEvaluations.push({
          dataSet: dataSet._id,
          score: proportionalScore,
          referenceData: referenceData,
          simulationData: simulationData,
          errorData: errorData,
        })

        currentScore += proportionalScore
      }

      await Agents.updateObjAsync({
        _id: agentId,
        current: {
          score: currentScore,
          dataSetsEvaluations: dataSetsEvaluations,
          valid: true,
        },
      })
    }

    async function updateBestScore(agentId) {
      const agent = await Agents.findOneAsync(agentId)

      if (!agent.current.valid) return

      // If the current agent's simulation is better than the best agent's simulation or if it does not have a valid
      // best score, then the best agent's simulation object is updated with the current agent's object
      if (agent.current.score < agent.best.score || !agent.best.valid) {
        // Clones the current simulation (thus, scenery and materials).
        const newBestSimulationId = await Simulations.clone(agent.current.simulation, false)

        // Removes the old best simulation, no need to await for it.
        await Simulations.removeAsync(agent.best.simulation)

        // Updates the best object with the new best simulation id and its score.
        await Agents.updateObjAsync({
          _id: agentId,
          best: { score: agent.current.score, simulation: newBestSimulationId, valid: true },
        })
      }
    }

    function assessStartCondition(startCondition, startThreshold, value) {
      switch (startCondition) {
        case "lt":
          return value < startThreshold
        case "lte":
          return value <= startThreshold
        case "eq":
          return value === startThreshold
        case "gte":
          return value >= startThreshold
        case "gt":
          return value > startThreshold
        default:
          return false
      }
    }
  }

  static async updateBestGlobal(calibrationId) {
    const bestScores = await Agents.find({ owner: calibrationId, "best.valid": true }).mapAsync(agent => ({
      agentId: agent._id,
      score: agent.best.score,
    }))

    // If no valid best scores are found, then the best global agent is not updated.
    if (bestScores.length === 0) return

    // Gets the agentId with the lowest score
    const bestGAgentId = bestScores.reduce(
      (acc, score) => (score.score < acc.score ? score : acc),
      bestScores[0]
    ).agentId

    await Agents.setBestGlobal(bestGAgentId)
  }

  static async nextAllIterations(calibrationId) {
    const agents = await Agents.find({ owner: calibrationId }).fetchAsync()
    const bestGAgent = await Agents.getBestGlobal(calibrationId)

    // TODO: What if there is no bestGAgent, because no agent has a valid best score?

    const nextIterationsPromises = agents.map(agent => Agents.nextIteration(agent._id, bestGAgent._id))
    await Promise.all(nextIterationsPromises)
  }

  static async nextIteration(agentId, bestGAgentId) {
    const agent = await Agents.findOneAsync(agentId)
    const bestGAgent = await Agents.findOneAsync(bestGAgentId)

    await Simulations.reset(agent.current.simulation)

    await updateCoefficients(agent, bestGAgent)

    await Agents.updateObjAsync({ _id: agentId, iteration: agent.iteration + 1 })

    async function updateCoefficients(agent, bestGAgent) {
      const calibrationId = agent.owner
      const parameters = await Parameters.find({ owner: calibrationId }).fetchAsync()

      const updateCoefficientsPromises = parameters.map(parameter => updateCoefficient(parameter, agent, bestGAgent))
      await Promise.all(updateCoefficientsPromises)
    }

    async function updateCoefficient(parameter, agent, bestGAgent) {
      const scenery = await Sceneries.findOneAsync({ owner: agent.current.simulation })
      const bestScenery = await Sceneries.findOneAsync({ owner: agent.best.simulation })
      const bestGScenery = await Sceneries.findOneAsync({ owner: bestGAgent.best.simulation })

      switch (parameter.type) {
        case "material": {
          const referenceMaterial = await Materials.findOneAsync(parameter.materialObject)
          const currentMaterial = await Materials.findOneAsync({
            owner: scenery._id,
            callSign: referenceMaterial.callSign,
          })
          const bestMaterial = await Materials.findOneAsync({
            owner: bestScenery._id,
            callSign: referenceMaterial.callSign,
          })
          const bestGMaterial = await Materials.findOneAsync({
            owner: bestGScenery._id,
            callSign: referenceMaterial.callSign,
          })

          const coefficient = parameter.coefficient

          const value = calculateCoefficient(
            _.get(currentMaterial, coefficient),
            _.get(bestMaterial, coefficient),
            _.get(bestGMaterial, coefficient),
            parameter.c1,
            parameter.c2,
            parameter.perturbation,
            parameter.allowNegative
          )

          _.set(currentMaterial, coefficient, value)
          await Materials.updateObjAsync(currentMaterial)

          break
        }
        case "nonSolidObject": {
          const referenceNSO = await NonSolidObjects.findOneAsync(parameter.materialObject)
          const currentNSO = await NonSolidObjects.findOneAsync({ owner: scenery._id, callSign: referenceNSO.callSign })
          const bestNSO = await NonSolidObjects.findOneAsync({
            owner: bestScenery._id,
            callSign: referenceNSO.callSign,
          })
          const bestGNSO = await NonSolidObjects.findOneAsync({
            owner: bestGScenery._id,
            callSign: referenceNSO.callSign,
          })

          const coefficient = parameter.coefficient
          const value = calculateCoefficient(
            _.get(currentNSO, coefficient),
            _.get(bestNSO, coefficient),
            _.get(bestGNSO, coefficient),
            parameter.c1,
            parameter.c2,
            parameter.perturbation,
            parameter.allowNegative
          )

          _.set(currentNSO, coefficient, value)
          await NonSolidObjects.updateObjAsync(currentNSO)

          break
        }
        case "solidObject": {
          const referenceSO = await SolidObjects.findOneAsync(parameter.materialObject)
          const currentSO = await SolidObjects.findOneAsync({ owner: scenery._id, callSign: referenceSO.callSign })
          const bestSO = await SolidObjects.findOneAsync({ owner: bestScenery._id, callSign: referenceSO.callSign })
          const bestGSO = await SolidObjects.findOneAsync({ owner: bestGScenery._id, callSign: referenceSO.callSign })

          const coefficient = parameter.coefficient
          const value = calculateCoefficient(
            _.get(currentSO, coefficient),
            _.get(bestSO, coefficient),
            _.get(bestGSO, coefficient),
            parameter.c1,
            parameter.c2,
            parameter.perturbation,
            parameter.allowNegative
          )

          _.set(currentSO, coefficient, value)
          await SolidObjects.updateObjAsync(currentSO)

          break
        }
      }
    }

    function calculateCoefficient(
      coefficient,
      bestCoefficient,
      bestGlobalCoefficient,
      c1,
      c2,
      perturbation,
      allowNegative
    ) {
      // Tries to find a valid coefficient 1000 times.
      for (let i = 0; i < 1000; i++) {
        const newValue = sortCoefficient()

        if (allowNegative || newValue >= 0) return newValue
      }

      // If we reach this point, it means that we couldn't find a valid coefficient after 1000 tries.
      // This should never happen, but just in case, we return the coefficient as 0 if it is negative and !allowNegative.
      return allowNegative ? coefficient : 0

      function sortCoefficient() {
        const random1 = Math.random()
        const random2 = Math.random()

        let bestVelocity = bestCoefficient - coefficient

        if (bestVelocity === 0) bestVelocity = Math.random() - 0.5

        bestVelocity *= perturbation * coefficient

        let bestGlobalVelocity = bestGlobalCoefficient - coefficient

        if (bestGlobalVelocity === 0) bestGlobalVelocity = Math.random() - 0.5

        bestGlobalVelocity *= perturbation * coefficient

        return coefficient + c1 * random1 * bestVelocity + c2 * random2 * bestGlobalVelocity
      }
    }
  }
}
