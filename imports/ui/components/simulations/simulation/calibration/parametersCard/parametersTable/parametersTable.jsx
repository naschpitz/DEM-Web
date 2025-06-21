import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import Parameters from "../../../../../../../api/parameters/both/class"

import Alert from "react-s-alert-v3"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import ReactTable from "react-table-v6"

import CoefficientSelect from "../coefficientSelect/coefficientSelect.jsx"
import MaterialObjectSelect from "../materialObjectSelect/materialObjectSelect.jsx"

import "./parametersTable.css"

export default (props) => {
  const [isParametersReady, setIsParametersReady] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const parameters = useTracker(() => {
    Meteor.subscribe("parameters.list", props.calibrationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsParametersReady(true),
    })

    return Parameters.find({ owner: props.calibrationId }).fetch()
  }, [props.calibrationId])

  function getColumns() {
    const typeOptions = [
      { value: "", text: "-- Select Type --" },
      { value: "material", text: "Material" },
      { value: "nonSolidObject", text: "Non-Solid Object" },
      { value: "solidObject", text: "Solid Object" },
    ]

    return [
      {
        Header: "Type",
        accessor: "type",
        Cell: cellInfo => (
          <FormInput
            name={cellInfo.column.id}
            value={cellInfo.original.type}
            type="dropdown"
            options={typeOptions}
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Material / Object",
        accessor: "materialObject",
        Cell: cellInfo => (
          <MaterialObjectSelect
            calibrationId={props.calibrationId}
            type={cellInfo.original.type}
            formInputProps={{
              name: cellInfo.column.id,
              value: cellInfo.original.materialObject,
              type: "dropdown",
              subtype: "string",
              autoComplete: false,
              size: "small",
              inputSizes: { sm: 12, md: 12, lg: 12, xl: 12 },
              onEvent: (event, name, value) => onEvent(event, cellInfo.original, name, value),
            }}
          />
        ),
      },
      {
        Header: "Coefficient",
        accessor: "coefficient",
        Cell: cellInfo => (
          <CoefficientSelect
            type={cellInfo.original.type}
            materialObjectId={cellInfo.original.materialObject}
            formInputProps={{
              name: cellInfo.column.id,
              value: cellInfo.original.coefficient,
              type: "dropdown",
              subtype: "string",
              autoComplete: false,
              size: "small",
              inputSizes: { sm: 12, md: 12, lg: 12, xl: 12 },
              onEvent: (event, name, value) => onEvent(event, cellInfo.original, name, value),
            }}
          />
        ),
      },
      {
        Header: "Variation",
        accessor: "variation",
        Cell: cellInfo => (
          <FormInput
            name={cellInfo.column.id}
            value={cellInfo.original.variation}
            type="field"
            subtype="percent"
            append="%"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "C1",
        accessor: "c1",
        Cell: cellInfo => (
          <FormInput
            name={cellInfo.column.id}
            value={cellInfo.original.c1}
            type="field"
            subtype="number"
            allowNegative={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "C2",
        accessor: "c2",
        Cell: cellInfo => (
          <FormInput
            name={cellInfo.column.id}
            value={cellInfo.original.c2}
            type="field"
            subtype="number"
            allowNegative={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Perturbation",
        accessor: "perturbation",
        Cell: cellInfo => (
          <FormInput
            name={cellInfo.column.id}
            value={cellInfo.original.perturbation}
            type="field"
            subtype="percent"
            append="%"
            allowNegative={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Allow Negative",
        accessor: "allowNegative",
        Cell: cellInfo => (
          <div className="d-flex ml-auto mr-auto">
            <FormInput
              name={cellInfo.column.id}
              value={cellInfo.original.allowNegative}
              type="checkbox"
              size="small"
              inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
              onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
            />
          </div>
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
              text: <span>Do you really want to remove this parameter?</span>,
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

  function onEvent(event, data, name, value) {
    const parameter = { _id: data._id }

    _.set(parameter, name, value)

    if (event === "onBlur" || (event === "onChange" && (name === "type" || "material" || "coefficient"))) {
      Meteor.callAsync("parameters.update", parameter)
        .catch((error) => {
          Alert.error("Error updating parameter: " + getErrorMessage(error))
        })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    setIsRemoving(true)

    const parameterId = data.original._id

    Meteor.callAsync("parameters.remove", parameterId)
      .then(() => {
        Alert.success("Parameter successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing parameter: " + error.reason)
      })
      .finally(() => {
        setIsRemoving(false)
      })
  }

  return (
    <div id="parametersTable">
      <ReactTable
        data={parameters}
        loading={!isParametersReady}
        loadingText="Loading parameters list..."
        columns={getColumns()}
        collapseOnDataChange={false}
        defaultPageSize={5}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
      />
    </div>
  )
}
