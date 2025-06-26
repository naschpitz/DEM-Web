import React, { useState, useMemo } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper } from "@tanstack/react-table"

import Table from "../../../../../table/table.jsx"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import Parameters from "../../../../../../../api/parameters/both/class"

import Alert from "../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import CoefficientSelect from "../coefficientSelect/coefficientSelect.jsx"
import MaterialObjectSelect from "../materialObjectSelect/materialObjectSelect.jsx"
import useIsState from "../../../../../../hooks/useIsState.js"

import "./parametersTable.css"

export default props => {
  const [isParametersReady, setIsParametersReady] = useState(false)
  const isRemoving = useIsState()

  const parameters = useTracker(() => {
    Meteor.subscribe("parameters.list", props.calibrationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsParametersReady(true),
    })

    return Parameters.find({ owner: props.calibrationId }).fetch()
  }, [props.calibrationId])

  // Create reactive data for the table
  const data = useMemo(() => {
    return parameters.map(parameter => ({
      ...parameter,
    }))
  }, [parameters])

  const columnHelper = createColumnHelper()

  const typeOptions = [
    { value: "", text: "-- Select Type --" },
    { value: "material", text: "Material" },
    { value: "nonSolidObject", text: "Non-Solid Object" },
    { value: "solidObject", text: "Solid Object" },
  ]

  const columns = useMemo(
    () => [
      columnHelper.accessor("type", {
        header: "Type",
        cell: info => (
          <FormInput
            name="type"
            value={info.getValue()}
            type="dropdown"
            options={typeOptions}
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("materialObject", {
        header: "Material / Object",
        cell: info => (
          <MaterialObjectSelect
            calibrationId={props.calibrationId}
            type={info.row.original.type}
            formInputProps={{
              name: "materialObject",
              value: info.getValue(),
              type: "dropdown",
              subtype: "string",
              autoComplete: false,
              size: "small",
              inputSizes: { sm: 12, md: 12, lg: 12, xl: 12 },
              onEvent: (event, name, value) => onEvent(event, info.row.original, name, value),
            }}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("coefficient", {
        header: "Coefficient",
        cell: info => (
          <CoefficientSelect
            type={info.row.original.type}
            materialObjectId={info.row.original.materialObject}
            formInputProps={{
              name: "coefficient",
              value: info.getValue(),
              type: "dropdown",
              subtype: "string",
              autoComplete: false,
              size: "small",
              inputSizes: { sm: 12, md: 12, lg: 12, xl: 12 },
              onEvent: (event, name, value) => onEvent(event, info.row.original, name, value),
            }}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("variation", {
        header: "Variation",
        cell: info => (
          <FormInput
            name="variation"
            value={info.getValue()}
            type="field"
            subtype="percent"
            append="%"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("c1", {
        header: "C1",
        cell: info => (
          <FormInput
            name="c1"
            value={info.getValue()}
            type="field"
            subtype="number"
            allowNegative={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("c2", {
        header: "C2",
        cell: info => (
          <FormInput
            name="c2"
            value={info.getValue()}
            type="field"
            subtype="number"
            allowNegative={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("perturbation", {
        header: "Perturbation",
        cell: info => (
          <FormInput
            name="perturbation"
            value={info.getValue()}
            type="field"
            subtype="percent"
            append="%"
            allowNegative={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor("allowNegative", {
        header: "Allow Negative",
        cell: info => (
          <div className="d-flex ml-auto mr-auto">
            <FormInput
              name="allowNegative"
              value={info.getValue()}
              type="checkbox"
              size="small"
              inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
              onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
            />
          </div>
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
              title: "Confirm parameter removal",
              text: <span>Do you really want to remove this parameter?</span>,
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onRemoveDone,
            }}
          />
        ),
        meta: { className: "text-center" },
      }),
    ],
    [isRemoving.isState, typeOptions, props.calibrationId]
  )

  function onEvent(event, data, name, value) {
    const parameter = { _id: data._id }

    _.set(parameter, name, value)

    if (event === "onBlur" || (event === "onChange" && (name === "type" || "material" || "coefficient"))) {
      Meteor.callAsync("parameters.update", parameter).catch(error => {
        Alert.error("Error updating parameter: " + getErrorMessage(error))
      })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    const parameterId = data._id
    isRemoving.setState(parameterId, true)

    Meteor.callAsync("parameters.remove", parameterId)
      .then(() => {
        Alert.success("Parameter successfully removed.")
      })
      .catch(error => {
        Alert.error("Error removing parameter: " + error.reason)
      })
      .finally(() => {
        isRemoving.setState(parameterId, false)
      })
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: "onChange", // "onEnd" also supported
    initialState: {
      pagination: {
        pageSize: 5,
      },
      columnSizing: {
        type: 300,
        materialObject: 400,
        coefficient: 300,
        variation: 150,
        c1: 150,
        c2: 150,
        perturbation: 150,
        allowNegative: 150,
        remove: 100,
      },
    },
  })

  if (!isParametersReady) {
    return (
      <div id="parametersTable">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading parameters list...</span>
          </div>
          <div className="mt-2">Loading parameters list...</div>
        </div>
      </div>
    )
  }

  if (parameters.length === 0) {
    return (
      <div id="parametersTable">
        <div className="text-center p-4">
          <div className="text-muted">No parameters found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="parametersTable">
      <Table table={table} tableId="parametersTable" />
    </div>
  )
}
