import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import Parameters from "../../../../../../../api/parameters/both/class"

import Alert from "../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

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

  // Create reactive data for the table
  const data = React.useMemo(() => {
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

  const columns = React.useMemo(() => [
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
            data: info,
            className: "btn btn-sm btn-danger ml-auto mr-auto",
            isAction: isRemoving,
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
  ], [isRemoving, typeOptions, props.calibrationId])

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

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 5,
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
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
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
