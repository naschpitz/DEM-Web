import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useNavigate } from "react-router-dom"

import AgentsClass from "/imports/api/agents/both/class"
import LogsClass from "../../../../../../../api/logs/both/class"

import Alert from "react-s-alert-v3"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import ReactTable from "react-table-v6"

import "./historyTable.css"

export default HistoryTable = props => {
  const [isAgentReady, setIsAgentReady] = useState(false)
  const [isLogsReady, setIsLogsReady] = useState(false)

  const navigate = useNavigate()

  useTracker(() => {
    if (!props.agentId) return

    Meteor.subscribe("agents.agent", props.agentId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentReady(true),
    })
  }, [props.agentId])

  const history = useTracker(() => {
    const agent = AgentsClass.findOne(props.agentId)

    return agent?.history ? agent.history : []
  }, [props.agentId])

  useTracker(() => {
    const simulationsIds = history.map(history => history.current.simulation)

    Meteor.subscribe("logs.last", false, simulationsIds, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsLogsReady(true),
    })
  }, [history])

  const logs = useTracker(() => {
    if (!isAgentReady) return []

    const simulationsIds = history.map(history => history.current.simulation)

    return LogsClass.find({ owner: { $in: simulationsIds } }).fetch()
  }, [history, isAgentReady])

  function getColumns() {
    return [
      {
        Header: "Iteration",
        id: "iteration",
        className: "text-center",
        width: 75,
        accessor: data => data.iteration,
      },
      {
        Header: "Current Score",
        id: "currentScore",
        className: "text-center",
        width: 100,
        accessor: data => data.current.score,
      },
      {
        Header: "Best Score",
        id: "bestScore",
        className: "text-center",
        width: 100,
        accessor: data => data.best.score,
      },
      {
        Header: "Was Best Global?",
        id: "wasBestGlobal",
        className: "text-center",
        width: 100,
        accessor: data => (data.best.bestGlobal ? "Yes" : "No"),
      },
      {
        Header: "State",
        id: "state",
        className: "text-center",
        accessor: data => {
          const simulationLog = logs.find(simulationLog => data.current.simulation === simulationLog.owner)

          return LogsClass.getState(simulationLog)
        },
      },
      {
        Header: "Progress",
        id: "progress",
        className: "text-center",
        accessor: data => {
          const simulationLog = logs.find(simulationLog => data.current.simulation === simulationLog.owner)

          return LogsClass.getPercentage(simulationLog)
        },
        Cell: cellInfo => (
          <div className="progress text-center">
            <div
              className={getProgressBarClassName(cellInfo.original.current.simulation, cellInfo.value)}
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
        Header: "Details",
        id: "details",
        className: "text-center",
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

  function getProgressBarClassName(simulationId, percentage) {
    const simulationLog = logs.find(simulationLog => simulationId === simulationLog.owner)
    const state = LogsClass.getState(simulationLog)

    let className = "progress-bar massive-font "

    const value = percentage.value

    if (value) {
      if (value > 66) className += "progress-bar-success "
      else if (value > 33) className += "progress-bar-warning "
      else className += "progress-bar-danger "
    }

    if (state === "running") className += "progress-bar-striped active"

    return className
  }

  function onDetailsClick(data) {
    navigate("/simulations/" + data.original.current.simulation)
  }

  const isReady = isAgentReady && isLogsReady

  return (
    <div id="historyTable">
      <ReactTable
        data={history}
        loading={!isReady}
        loadingText="Loading agent history list..."
        columns={getColumns()}
        defaultPageSize={10}
        collapseOnDataChange={false}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
      />
    </div>
  )
}
