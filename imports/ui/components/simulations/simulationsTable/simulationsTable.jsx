import React, { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { FaChevronRight, FaChevronDown } from "react-icons/all"
import moment from "moment"
import _ from "lodash"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  createColumnHelper,
} from "@tanstack/react-table"

import Table from "../../table/table.jsx"

import getErrorMessage from "../../../../api/utils/getErrorMessage.js"
import SimulationsClass from "../../../../api/simulations/both/class.js"
import LogsClass from "../../../../api/logs/both/class.js"

import Alert from "../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import Spinner from "../../spinner/spinner.jsx"

import SimulationControl from "../simulationControl/simulationControl.jsx"

import "./simulationsTable.css"

export default props => {
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
      { sort: { createdAt: -1 } }
    ).fetch()
  }, [props.simulationsIds])

  const logs = useTracker(() => {
    return LogsClass.find({ progress: { $exists: true } }, { sort: { createdAt: -1 } }).fetch()
  }, [props.simulationsIds])

  const data = useMemo(() => {
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

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            className="expansion-btn"
            onClick={e => {
              e.preventDefault()
              e.stopPropagation()
              row.toggleExpanded()
            }}
            type="button"
          >
            {row.getIsExpanded() ? <FaChevronDown /> : <FaChevronRight />}
          </button>
        ),
        size: 30,
      }),
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
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor(row => SimulationsClass.getState(row), {
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
    ],
    []
  )

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
      Meteor.callAsync("simulations.update", simulation).catch(error => {
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
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: "onChange", // "onEnd" also supported
    initialState: {
      pagination: {
        pageSize: 5,
      },
      expanded: {},
      columnSizing: {
        expander: 20,
        name: 800,
        progress: 400,
        et: 300,
        eta: 300,
        createdAt: 300,
        details: 100,
      },
    },
  })

  if (!isReady) {
    return (
      <div id="simulationsTable">
        <Spinner message="Loading simulations list..." />
      </div>
    )
  }

  return (
    <div id="simulationsTable">
      <Table
        table={table}
        expansionComponent={rowData => <SimulationControl simulationId={rowData._id} />}
        tableId="simulationsTable"
        padRows={true}
        emptyText="No simulations found."
      />
    </div>
  )
}
