import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import getErrorMessage from "../../../../api/utils/getErrorMessage.js"
import SimulationsClass from "../../../../api/simulations/both/class.js"
import LogsClass from "../../../../api/logs/both/class.js"

import Alert from "../../../utils/Alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import ReactTable from "react-table-v6"

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
  })

  function getColumns() {
    return [
      {
        Header: "Name",
        accessor: "name",
        Cell: cellInfo => (
          <FormInput
            name="name"
            value={getValue(cellInfo)}
            type="field"
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "State",
        id: "state",
        className: "text-center",
        accessor: data => {
          return SimulationsClass.getState(data)
        },
      },
      {
        Header: "Progress",
        id: "progress",
        className: "text-center",
        accessor: data => {
          const simulationLog = logs.find(simulationLog => data._id === simulationLog.owner)

          return LogsClass.getPercentage(simulationLog)
        },
        Cell: cellInfo => (
          <div className="progress text-center">
            <div
              className={getProgressBarClassName(cellInfo.original.state, cellInfo.value)}
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
        accessor: data => {
          const simulationLog = logs.find(simulationLog => data._id === simulationLog.owner)

          return LogsClass.getEt(simulationLog)
        },
      },
      {
        Header: "ETA",
        id: "eta",
        className: "text-center",
        accessor: data => {
          const simulationLog = logs.find(simulationLog => data._id === simulationLog.owner)

          return LogsClass.getEta(simulationLog)
        },
      },
      {
        Header: "Created At",
        id: "createdAt",
        className: "text-center",
        accessor: data => data.createdAt,
        Cell: cellInfo => moment(cellInfo.original.createdAt).format("L HH:mm:ss"),
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

  function getValue(cellInfo) {
    const name = cellInfo.column.id

    return _.get(cellInfo.original, name)
  }

  function getProgressBarClassName(state, percentage) {
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
    navigate("/simulations/" + data.original._id)
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

  return (
    <div id="simulationsTable">
      <ReactTable
        data={simulations}
        loading={!isReady}
        loadingText="Loading simulations list..."
        noDataText="No simulations found."
        columns={getColumns()}
        defaultPageSize={5}
        collapseOnDataChange={false}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
        SubComponent={({ original }) => <SimulationControl simulationId={original._id} />}
      />
    </div>
  )
}
