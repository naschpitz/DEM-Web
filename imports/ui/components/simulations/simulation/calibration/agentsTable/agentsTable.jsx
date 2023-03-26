import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import AgentsClass from "../../../../../../api/agents/both/class"
import LogsClass from "../../../../../../api/logs/both/class"
import SimulationsClass from "../../../../../../api/simulations/both/class"

import Alert from "react-s-alert-v3"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import ReactTable from "react-table-v6"

import "./agentsTable.css"

export default AgentsTable = props => {
  const [isAgentsReady, setIsAgentsReady] = useState(false)
  const [isLogsReady, setIsLogsReady] = useState(false)
  const [isSimulationsReady, setIsSimulationsReady] = useState(false)

  const navigate = useNavigate()
  const params = useParams()

  const simulationId = params.simulationId

  useTracker(() => {
    Meteor.subscribe("agents.list", props.calibrationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentsReady(true),
    })
  }, [props.calibrationId])

  const agents = useTracker(() => {
    return AgentsClass.find({ owner: props.calibrationId }, { sort: { index: 1 } }).fetch()
  }, [props.calibrationId])

  useTracker(() => {
    if (!isAgentsReady) return

    const simulationsIds = agents.map(agent => agent.current.simulation)

    Meteor.subscribe("logs.last", false, simulationsIds, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsLogsReady(true),
    })
  }, [agents, isAgentsReady])

  useTracker(() => {
    if (!isAgentsReady) return

    const simulationsIds = agents.map(agent => agent.current.simulation)

    Meteor.subscribe("simulations.byIds", simulationsIds, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationsReady(true),
    })
  }, [agents, isAgentsReady])

  const tableData = useTracker(() => {
    if (!isLogsReady || !isSimulationsReady) return []

    return agents.map(agent => {
      const simulationId = agent.current.simulation

      const simulation = SimulationsClass.findOne(simulationId)
      const log = LogsClass.findOne({ owner: simulationId })

      return {
        agent,
        simulation,
        log,
      }
    })
  }, [isLogsReady, isSimulationsReady, agents])

  function getColumns() {
    return [
      {
        Header: "Index",
        id: "index",
        className: "text-center",
        width: 75,
        accessor: data => "#" + data.agent.index,
      },
      {
        Header: "Iteration",
        id: "iteration",
        className: "text-center",
        width: 75,
        accessor: data => data.agent.iteration,
      },
      {
        Header: "Current Score",
        id: "currentScore",
        className: "text-center",
        width: 100,
        accessor: data => data.agent.current.score,
      },
      {
        Header: "Is the Best?",
        id: "isBest",
        className: "text-center",
        width: 100,
        accessor: data => (data.agent.best.bestGlobal ? "Yes" : "No"),
      },
      {
        Header: "State",
        id: "state",
        className: "text-center",
        width: 150,
        accessor: data => SimulationsClass.getState(data.simulation),
      },
      {
        Header: "Progress",
        id: "progress",
        className: "text-center",
        accessor: data => LogsClass.getPercentage(data.log),
        Cell: cellInfo => (
          <div className="progress text-center">
            <div
              className={getProgressBarClassName(cellInfo.original.simulation?.state, cellInfo.value.value)}
              role="progressbar"
              aria-valuenow={cellInfo.value.value}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: cellInfo.value.value + "%", color: "black" }}
            >
              {cellInfo.value.text}
            </div>
          </div>
        ),
      },
      {
        Header: "ET",
        id: "et",
        className: "text-center",
        width: 200,
        accessor: data => LogsClass.getEt(data.log),
      },
      {
        Header: "ETA",
        id: "eta",
        className: "text-center",
        width: 200,
        accessor: data => LogsClass.getEta(data.log),
      },
      {
        Header: "Details",
        id: "details",
        className: "text-center",
        width: 150,
        Cell: cellInfo => (
          <ButtonEnhanced
            buttonOptions={{
              regularText: "Details",
              data: cellInfo,
              onClick: onDetailsClick,
              className: "btn btn-sm btn-info ml-auto mr-auto",
              type: "button",
            }}
          />
        ),
      },
    ]
  }

  function getProgressBarClassName(state, percentage) {
    let className = "progress-bar massive-font "

    if (percentage) {
      if (percentage > 66) className += "progress-bar-success "
      else if (percentage > 33) className += "progress-bar-warning "
      else className += "progress-bar-danger "
    }

    if (state === "running") className += "progress-bar-striped active"

    return className
  }

  function onDetailsClick(data) {
    const agentId = data.original.agent._id

    navigate("/simulations/" + simulationId + "/calibration/agents/" + agentId)
  }

  const isReady = isAgentsReady && isLogsReady && isSimulationsReady

  return (
    <div id="agentsTable">
      <ReactTable
        data={tableData}
        loading={!isReady}
        loadingText="Loading agents list..."
        columns={getColumns()}
        collapseOnDataChange={false}
        defaultPageSize={10}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
      />
    </div>
  )
}
