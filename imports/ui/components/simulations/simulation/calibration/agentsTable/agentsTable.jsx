import React, { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"

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
    },
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

  if (tableData.length === 0) {
    return (
      <div id="agentsTable">
        <div className="text-center p-4">
          <div className="text-muted">No agents found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="agentsTable">
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={header.column.columnDef.meta?.className || ""}
                    style={{
                      position: "relative",
                      width: header.getSize(), // Dynamic width
                    }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}

                    {/* Resize handle */}
                    {header.column.getCanResize() && (
                      <div
                        onMouseDown={header.getResizeHandler()}
                        onTouchStart={header.getResizeHandler()}
                        className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                      />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr key={row.id}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className || ""}
                    style={{ verticalAlign: "middle" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - responsive design */}
      <div className="pagination-wrapper">
        <div className="pagination-controls">
          <button
            className="btn btn-secondary pagination-btn"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            {"<<"}
          </button>
          <button
            className="btn btn-secondary pagination-btn"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>

          <div className="pagination-info">
            <span className="page-text">Page</span>
            <input
              type="number"
              className="page-input"
              value={table.getState().pagination.pageIndex + 1}
              onChange={e => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                table.setPageIndex(page)
              }}
              min="1"
              max={table.getPageCount()}
            />
            <span className="page-text">of {table.getPageCount()}</span>
          </div>

          <select
            className="form-control page-size-select"
            value={table.getState().pagination.pageSize}
            onChange={e => {
              table.setPageSize(Number(e.target.value))
            }}
          >
            {[5, 10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                {pageSize} rows
              </option>
            ))}
          </select>

          <button
            className="btn btn-secondary pagination-btn"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
          <button
            className="btn btn-secondary pagination-btn"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            {">>"}
          </button>
        </div>
      </div>
    </div>
  )
}
