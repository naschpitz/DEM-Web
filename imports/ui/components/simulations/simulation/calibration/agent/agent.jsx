import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useParams } from "react-router-dom"

import getErrorMessage from "../../../../../../api/utils/getErrorMessage.js"
import Agents from "../../../../../../api/agents/both/class"
import Simulations from "../../../../../../api/simulations/both/class"

import Alert from "../../../../../utils/alert.js"
import ClipLoader from "react-spinners/ClipLoader"

import DataSetsEvaluationsCard from "./dataSetsEvaluationsCard/dataSetsEvaluationsCard";
import HistoryTable from "./historyTable/historyTable"
import Main from "../../main/main"

import "./agent.css"

export default () => {
  const [isSimulationReady, setIsSimulationReady] = useState(false)
  const [isAgentReady, setIsAgentReady] = useState(false)

  const params = useParams()

  const simulationId = params.simulationId
  const agentId = params.agentId

  useTracker(() => {
    if (!simulationId) return

    Meteor.subscribe("simulations.simulation", simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationReady(true),
    })
  }, [simulationId])

  const simulation = useTracker(() => {
    return Simulations.findOne(simulationId)
  })

  useTracker(() => {
    if (!agentId) return

    Meteor.subscribe("agents.agent", agentId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentReady(true),
    })
  }, [agentId])

  const agent = useTracker(() => {
    return Agents.findOne(agentId)
  })

  const isReady = isSimulationReady && isAgentReady

  if (isReady) {
    if (agent && simulation) {
      return (
        <div className="container-fluid" id="agent">
          <h2 className="text-center">
            {simulation.name} - #{agent.index}
          </h2>

          <div id="currentSimulationCard" className="card addMargin">
            <div className="card-header">
              Current Simulation
            </div>

            <div className="card-body">
              <Main name="main" simulationId={agent.current.simulation} primary={false} />
            </div>
          </div>

          <div id="historyCard" className="card addMargin">
            <div className="card-header">
              History
            </div>

            <div className="card-body">
              <HistoryTable agentId={agentId} />
            </div>
          </div>

          <div className="addMargin">
            <DataSetsEvaluationsCard agentId={agentId} />
          </div>
        </div>
      )
    } else {
      return (
        <div id="agent" className="alert alert-warning" role="alert">
          No Agent and/or Simulation found.
        </div>
      )
    }
  } else {
    return (
      <div className="container-fluid text-center" id="agent">
        <ClipLoader size={50} color={"#DDD"} loading={true} />
      </div>
    )
  }
}
