import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import PropTypes from "prop-types"
import _ from "lodash"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage.js"
import CameraFiltersClass from "../../../../../../../../api/cameraFilters/both/class.js"

import Alert from "../../../../../../../utils/alert.js";
import { ButtonEnhanced } from "@naschpitz/button-enhanced";
import FormInput from "@naschpitz/form-input";
import { useTracker } from "meteor/react-meteor-data";
import ReactTable from "react-table-v6";

import "./cameraFiltersTable.css"

export default (props) => {
  const [isReady, setIsReady] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useTracker(() => {
    Meteor.subscribe("cameraFilters.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const cameraFilters = useTracker(() => {
    return CameraFiltersClass.find({ owner: props.sceneryId }).fetch()
  })

  function getColumns() {
    const axisOptions = [
      { value: "", text: "-- Select Type --" },
      { value: "x", text: "X" },
      { value: "y", text: "Y" },
      { value: "z", text: "Z" },
    ]

    return [
      {
        Header: "Axis",
        accessor: "axis",
        Cell: cellInfo => (
          <FormInput
            name="axis"
            value={getValue(cellInfo)}
            type="dropdown"
            options={axisOptions}
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Min",
        accessor: "min",
        Cell: cellInfo => (
          <FormInput
            name="min"
            value={getValue(cellInfo)}
            type="field"
            subtype="number"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Max",
        accessor: "max",
        Cell: cellInfo => (
          <FormInput
            name="max"
            value={getValue(cellInfo)}
            type="field"
            subtype="number"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Remove",
        id: "removeButton",
        className: "text-center",
        Cell: cellInfo => (
          <ButtonEnhanced
            buttonOptions={{
              regularText: "Remove",
              data: cellInfo,
              className: "btn btn-sm btn-danger ml-auto mr-auto",
              isAction: isRemoving,
              actionText: "Removing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm object removal",
              text: (
                <span>
                  Do you really want to remove the object <strong>{cellInfo.original.name}</strong> ?
                </span>
              ),
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onRemoveDone,
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

  function onEvent(event, data, name, value) {
    const cameraFilter = { _id: data._id }

    _.set(cameraFilter, name, value)

    if (event === "onBlur" || (event === "onChange" && (name === "axis"))) {
      Meteor.callAsync("cameraFilters.update", cameraFilter)
        .catch((error) => {
          Alert.error("Error updating camera filter: " + getErrorMessage(error))
        })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    setIsRemoving(true)

    Meteor.callAsync("cameraFilters.remove", data.original._id)
      .then(() => {
        Alert.success("Camera filter successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing camera filter object: " + error.reason)
      })
      .finally(() => {
        setIsRemoving(false)
      })
  }

  return (
    <div id="cameraFiltersTable">
      <ReactTable
        data={cameraFilters}
        columns={getColumns()}
        defaultPageSize={5}
        collapseOnDataChange={false}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
      />
    </div>
  )
}