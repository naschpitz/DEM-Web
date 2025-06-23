import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"

import getErrorMessage from "../../../../api/utils/getErrorMessage.js"
import SimulationsClass from "../../../../api/simulations/both/class.js"
import LogsClass from "../../../../api/logs/both/class.js"

import Alert from "../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import SimulationControl from "../simulationControl/simulationControl.jsx"

import "./simulationsTable.css"

export default (props) => {
  const [isReady, setIsReady] = useState(false)

  const navigate = useNavigate()

  useTracker(() => {
    Meteor.subscribe("logs.last", true, props.simulationsIds, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.simulationsIds])

  const simulations = useTracker(() => {
    return SimulationsClass.find(
      { _id: { $in: props.simulationsIds }, primary: true },
      { sort: { createdAt: -1 } }).fetch()
  }, [props.simulationsIds])

  const logs = useTracker(() => {
    return LogsClass.find({ progress: { $exists: true } }, { sort: { createdAt: -1 } }).fetch()
  }, [props.simulationsIds])

  const data = React.useMemo(() => {
    return simulations.map(simulation => {
      const log = logs.find(log => log.owner === simulation._id)

      return {
        ...simulation,
        log,
        progress: LogsClass.getPercentage(log),
        eta: LogsClass.getEta(log),
        et: LogsClass.getEt(log),
      }
    })
  }, [simulations, logs])

  const columnHelper = createColumnHelper()

  const columns = React.useMemo(() => [
    columnHelper.accessor("name", {
      header: "Name",
      cell: info => (
        <FormInput
          name="name"
          value={info.getValue()}
          type="field"
          subtype="string"
          autoComplete={false}
          size="small"
          inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
          onEvent={(event, name, value) =>
            onEvent(event, info.row.original, name, value)
          }
        />
      ),
      meta: { className: "text-center" },
    }),
    columnHelper.accessor(
      row => SimulationsClass.getState(row),
      {
        id: "state",
        header: "State",
        meta: { className: "text-center" },
      }
    ),
    columnHelper.accessor("progress", {
      id: "progress",
      header: "Progress",
      cell: info => {
        const progressData = info.getValue()
        if (!progressData) return "N/A"
        return (
          <div className="progress text-center">
            <div
              className={getProgressBarClassName(info.row.original.state, progressData)}
              role="progressbar"
              aria-valuenow={progressData.value || 0}
              aria-valuemin="0"
              aria-valuemax="100"
              style={{ width: (progressData.value || 0) + "%", color: "black" }}
            >
              {progressData.text || ""}
            </div>
          </div>
        )
      },
      meta: { className: "text-center" },
    }),
    columnHelper.accessor("et", {
      id: "et",
      header: "ET",
      meta: { className: "text-center" },
    }),
    columnHelper.accessor("eta", {
      id: "eta",
      header: "ETA",
      meta: { className: "text-center" },
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      cell: info => moment(info.getValue()).format("L HH:mm:ss"),
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

  function getProgressBarClassName(state, percentage) {
    let className = "progress-bar massive-font "

    const value = percentage?.value

    if (value) {
      if (value > 66) className += "progress-bar-success "
      else if (value > 33) className += "progress-bar-warning "
      else className += "progress-bar-danger "
    }

    if (state === "running") className += "progress-bar-striped active"

    return className
  }

  function onDetailsClick(data) {
    navigate("/simulations/" + data.row.original._id)
  }

  function onEvent(event, data, name, value) {
    const simulation = { _id: data._id }

    _.set(simulation, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("simulations.update", simulation)
        .catch((error) => {
          Alert.error("Error updating simulation: " + getErrorMessage(error))
        })
    }
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableExpanding: true,
    initialState: {
      pagination: {
        pageSize: 5,
      },
      expanded: {},
    },
  })

  if (!isReady) {
    return (
      <div id="simulationsTable">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading simulations list...</span>
          </div>
          <div className="mt-2">Loading simulations list...</div>
        </div>
      </div>
    )
  }

  if (simulations.length === 0) {
    return (
      <div id="simulationsTable">
        <div className="text-center p-4">
          <div className="text-muted">No simulations found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="simulationsTable">
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                <th style={{ width: "30px" }}></th>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={header.column.columnDef.meta?.className || ""}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <tr>
                  <td style={{ width: "30px", textAlign: "center", verticalAlign: "middle" }}>
                    <button
                      className="expansion-btn"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        row.toggleExpanded()
                      }}
                      type="button"
                    >
                      {row.getIsExpanded() ? "▼" : "▶"}
                    </button>
                  </td>
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
                {row.getIsExpanded() && (
                  <tr key={`${row.id}-expanded`}>
                    <td colSpan={row.getVisibleCells().length + 1} style={{ padding: "1rem" }}>
                      <SimulationControl simulationId={row.original._id} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - styled to match original */}
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
