import React, { useState, useMemo } from "react"
import { Meteor } from "meteor/meteor"
import PropTypes from "prop-types"
import _ from "lodash"

import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper } from "@tanstack/react-table"

import Table from "../../../../../../table/table"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage"
import CameraFiltersClass from "../../../../../../../../api/cameraFilters/both/class"

import Alert from "../../../../../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import { useTracker } from "meteor/react-meteor-data"
import useIsState from "../../../../../../../hooks/useIsState"

import "./cameraFiltersTable.css"

export default props => {
  const [isReady, setIsReady] = useState(false)
  const isRemoving = useIsState()

  useTracker(() => {
    Meteor.subscribe("cameraFilters.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const cameraFilters = useTracker(() => {
    return CameraFiltersClass.find({ owner: props.sceneryId }).fetch()
  }, [props.sceneryId])

  // Create reactive data for the table
  const data = useMemo(() => {
    return cameraFilters.map(cameraFilter => ({
      ...cameraFilter,
    }))
  }, [cameraFilters])

  const columnHelper = createColumnHelper()

  const axisOptions = useMemo(
    () => [
      { value: "", text: "-- Select Type --" },
      { value: "x", text: "X" },
      { value: "y", text: "Y" },
      { value: "z", text: "Z" },
    ],
    []
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor("axis", {
        header: "Axis",
        cell: info => (
          <FormInput
            name="axis"
            value={info.getValue()}
            type="dropdown"
            options={axisOptions}
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("min", {
        header: "Min",
        cell: info => (
          <FormInput
            name="min"
            value={info.getValue()}
            type="field"
            subtype="number"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("max", {
        header: "Max",
        cell: info => (
          <FormInput
            name="max"
            value={info.getValue()}
            type="field"
            subtype="number"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "remove",
        header: "Remove",
        cell: info => (
          <ButtonEnhanced
            buttonOptions={{
              regularText: "Remove",
              data: info.row.original,
              className: "btn btn-sm btn-danger ml-auto mr-auto",
              isAction: isRemoving.getState(info.row.original._id),
              actionText: "Removing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm camera filter removal",
              text: <span>Do you really want to remove this camera filter?</span>,
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onRemoveDone,
            }}
          />
        ),
        meta: {
          className: "text-center",
        },
      }),
    ],
    [isRemoving.isState, axisOptions]
  )

  function onEvent(event, data, name, value) {
    const cameraFilter = { _id: data._id }

    _.set(cameraFilter, name, value)

    if (event === "onBlur" || (event === "onChange" && name === "axis")) {
      Meteor.callAsync("cameraFilters.update", cameraFilter).catch(error => {
        Alert.error("Error updating camera filter: " + getErrorMessage(error))
      })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    const cameraFilterId = data._id
    isRemoving.setState(cameraFilterId, true)

    Meteor.callAsync("cameraFilters.remove", data._id)
      .then(() => {
        Alert.success("Camera filter successfully removed.")
      })
      .catch(error => {
        Alert.error("Error removing camera filter object: " + error.reason)
      })
      .finally(() => {
        isRemoving.setState(cameraFilterId, false)
      })
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: "onChange", // "onEnd" also supported
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: 5,
      },
      columnSizing: {
        axis: 200,
        min: 200,
        max: 200,
        remove: 200,
      },
    },
  })

  if (!isReady) {
    return (
      <div id="cameraFiltersTable">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading camera filters...</span>
          </div>
          <div className="mt-2">Loading camera filters...</div>
        </div>
      </div>
    )
  }

  if (cameraFilters.length === 0) {
    return (
      <div id="cameraFiltersTable">
        <div className="text-center p-4">
          <div className="text-muted">No camera filters found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="cameraFiltersTable">
      <Table table={table} tableId="cameraFiltersTable" />
    </div>
  )
}
