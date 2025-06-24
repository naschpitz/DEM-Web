import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from "@tanstack/react-table"

import Table from "../../../../table/table.jsx"


import getErrorMessage from "../../../../../../api/utils/getErrorMessage.js"

import AgentsClass from "../../../../../../api/agents/both/class"
import LogsClass from "../../../../../../api/logs/both/class"
import SimulationsClass from "../../../../../../api/simulations/both/class"

import Alert from "../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import "./agentsTable.css"

export default (props) => {
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

  // Create reactive data for the table
  const data = React.useMemo(() => {
    return tableData.map(item => ({
      ...item,
    }))
  }, [tableData])

  const columnHelper = createColumnHelper()

  const columns = React.useMemo(() => [
    columnHelper.accessor(
      row => "#" + row.agent.index,
      {
        id: "index",
        header: "Index",
        meta: { className: "text-center" },
        size: 75,
      }
    ),
    columnHelper.accessor(
      row => row.agent.iteration,
      {
        id: "iteration",
        header: "Iteration",
        meta: { className: "text-center" },
        size: 75,
      }
    ),
    columnHelper.accessor(
      row => (row.agent.current.valid ? row.agent.current.score : "Invalid"),
      {
        id: "currentScore",
        header: "Current Score",
        meta: { className: "text-center" },
        size: 100,
      }
    ),
    columnHelper.accessor(
      row => (row.agent.best.valid ? row.agent.best.score : "Invalid"),
      {
        id: "bestScore",
        header: "Best Score",
        meta: { className: "text-center" },
        size: 100,
      }
    ),
    columnHelper.accessor(
      row => (row.agent.best.bestGlobal ? "Yes" : "No"),
      {
        id: "isBest",
        header: "Is the Best Global?",
        meta: { className: "text-center" },
        size: 100,
      }
    ),
    columnHelper.accessor(
      row => SimulationsClass.getState(row.simulation),
      {
        id: "state",
        header: "State",
        meta: { className: "text-center" },
        size: 150,
      }
    ),
    columnHelper.accessor(
      row => LogsClass.getPercentage(row.log),
      {
        id: "progress",
        header: "Progress",
        cell: info => {
          const progressData = info.getValue()
          return (
            <div className="progress text-center">
              <div
                className={getProgressBarClassName(info.row.original.simulation?.state, progressData.value)}
                role="progressbar"
                aria-valuenow={progressData.value}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: progressData.value + "%", color: "black" }}
              >
                {progressData.text}
              </div>
            </div>
          )
        },
        meta: { className: "text-center" },
      }
    ),
    columnHelper.accessor(
      row => LogsClass.getEt(row.log),
      {
        id: "et",
        header: "ET",
        meta: { className: "text-center" },
        size: 200,
      }
    ),
    columnHelper.accessor(
      row => LogsClass.getEta(row.log),
      {
        id: "eta",
        header: "ETA",
        meta: { className: "text-center" },
        size: 200,
      }
    ),
    columnHelper.display({
      id: "details",
      header: "Details",
      cell: info => (
        <ButtonEnhanced
          buttonOptions={{
            regularText: "Details",
            data: info,
            onClick: onDetailsClick,
            className: "btn btn-sm btn-info ml-auto mr-auto",
            type: "button",
          }}
        />
      ),
      meta: { className: "text-center" },
      size: 150,
    }),
  ], [])

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
    const agentId = data.row.original.agent._id

    navigate("/simulations/" + simulationId + "/calibration/agents/" + agentId)
  }

  const isReady = isAgentsReady && isLogsReady && isSimulationsReady

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: "onChange", // "onEnd" also supported
    initialState: {
      pagination: {
        pageSize: 10,
      },
      columnSizing: {}, // optional: initial sizes
    }
  })

  if (!isReady) {
    return (
      <div id="agentsTable">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading agents list...</span>
          </div>
          <div className="mt-2">Loading agents list...</div>
        </div>
      </div>
    )
  }

  return (
    <div id="agentsTable">
      <Table
        table={table}
        tableId="agentsTable"
        padRows={true}
        emptyText="No agents found."
      />
    </div>
  )
}
