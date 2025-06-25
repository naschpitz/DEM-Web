import React, { useState, useMemo } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { useNavigate } from "react-router-dom"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
} from "@tanstack/react-table"

import Table from "../../../../../table/table.jsx"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"

import AgentsHistories from "../../../../../../../api/agentsHistories/both/class";
import LogsClass from "../../../../../../../api/logs/both/class"

import Alert from "../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import "./historyTable.css"

export default (props) => {
  const [isAgentHistoriesReady, setIsAgentHistoriesReady] = useState(false)
  const [isLogsReady, setIsLogsReady] = useState(false)

  const navigate = useNavigate()

  useTracker(() => {
    if (!props.agentId) return

    Meteor.subscribe("agentsHistories.byOwner", props.agentId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentHistoriesReady(true),
    })
  }, [props.agentId])

  const agentHistories = useTracker(() => {
    return AgentsHistories.find({ owner: props.agentId }, { sort: { iteration: 1 }}).fetch()
  }, [props.agentId])

  useTracker(() => {
    const simulationsIds = agentHistories.map(agentHistory => agentHistory.current.simulation)

    Meteor.subscribe("logs.last", false, simulationsIds, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsLogsReady(true),
    })
  }, [agentHistories])

  const logs = useTracker(() => {
    if (!isAgentHistoriesReady) return []

    const simulationsIds = agentHistories.map(agentHistory => agentHistory.current.simulation)

    return LogsClass.find({ owner: { $in: simulationsIds } }).fetch()
  }, [agentHistories, isAgentHistoriesReady])

  // Create reactive data for the table - combine agentHistories with their logs
  const data = useMemo(() => {
    return agentHistories.map(agentHistory => {
      const simulationLog = logs.find(log => log.owner === agentHistory.current.simulation)

      return {
        ...agentHistory,
        log: simulationLog,
        state: LogsClass.getState(simulationLog),
        progress: LogsClass.getPercentage(simulationLog),
      }
    })
  }, [agentHistories, logs])

  const columnHelper = createColumnHelper()

  const columns = useMemo(() => [
    columnHelper.accessor(
      row => row.iteration,
      {
        id: "iteration",
        header: "Iteration",
        meta: { className: "text-center" },
        size: 75,
      }
    ),
    columnHelper.accessor(
      row => (row.current.valid ? row.current.score : "Invalid"),
      {
        id: "currentScore",
        header: "Current Score",
        meta: { className: "text-center" },
        size: 100,
      }
    ),
    columnHelper.accessor(
      row => (row.best.valid ? row.best.score : "Invalid"),
      {
        id: "bestScore",
        header: "Best Score",
        meta: { className: "text-center" },
        size: 100,
      }
    ),
    columnHelper.accessor(
      row => (row.best.bestGlobal ? "Yes" : "No"),
      {
        id: "wasBestGlobal",
        header: "Was Best Global?",
        meta: { className: "text-center" },
        size: 100,
      }
    ),
    columnHelper.accessor("state", {
      id: "state",
      header: "State",
      meta: { className: "text-center" },
    }),
    columnHelper.accessor("progress", {
      id: "progress",
      header: "Progress",
      cell: info => {
        const progressData = info.getValue()
        if (!progressData) return "N/A"
        return (
          <div className="progress text-center">
            <div
              className={getProgressBarClassName(info.row.original.current.simulation, progressData)}
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
    }),
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
    }),
  ], [])

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
    navigate("/simulations/" + data.row.original.current.simulation)
  }

  const isReady = isAgentHistoriesReady && isLogsReady

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
      columnSizing: {
        iteration: 100,
        currentScore: 150,
        bestScore: 150,
        wasBestGlobal: 100,
        state: 150,
        progress: 300,
        details: 100,
      },
    },
  })

  if (!isReady) {
    return (
      <div id="historyTable">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading agent history list...</span>
          </div>
          <div className="mt-2">Loading agent history list...</div>
        </div>
      </div>
    )
  }

  if (agentHistories.length === 0) {
    return (
      <div id="historyTable">
        <div className="text-center p-4">
          <div className="text-muted">No agent history found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="historyTable">
      <Table
        table={table}
        tableId="historyTable"
      />
    </div>
  )
}
