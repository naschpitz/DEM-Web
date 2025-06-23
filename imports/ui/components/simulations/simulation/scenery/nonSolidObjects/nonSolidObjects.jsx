import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"

import getErrorMessage from "../../../../../../api/utils/getErrorMessage.js"
import NonSolidObjectsClass from "../../../../../../api/nonSolidObjects/both/class.js"

import Alert from "../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import Properties from "./properties/properties.jsx"

import "./nonSolidObjects.css"

export default (props) => {
  const [isReady, setIsReady] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useTracker(() => {
    Meteor.subscribe("nonSolidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const nonSolidObjects = useTracker(() => {
    return NonSolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  }, [props.sceneryId])

  // Create reactive data for the table
  const data = React.useMemo(() => {
    return nonSolidObjects.map(nonSolidObject => ({
      ...nonSolidObject,
    }))
  }, [nonSolidObjects])

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
          onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
        />
      ),
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
            title: "Confirm object removal",
            text: (
              <span>
                Do you really want to remove the object <strong>{info.row.original.name}</strong> ?
              </span>
            ),
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
  ], [isRemoving])



  function onEvent(event, data, name, value) {
    const nonSolidObject = { _id: data._id }

    _.set(nonSolidObject, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("nonSolidObjects.update", nonSolidObject)
        .catch((error) => {
          Alert.error("Error updating non-solid object: " + getErrorMessage(error))
        })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    setIsRemoving(true)

    Meteor.callAsync("nonSolidObjects.remove", data.original._id)
      .then(() => {
        Alert.success("Non-solid object successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing non-solid object: " + error.reason)
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
      <div id="nonSolidObjects">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading non-solid objects...</span>
          </div>
          <div className="mt-2">Loading non-solid objects...</div>
        </div>
      </div>
    )
  }

  if (nonSolidObjects.length === 0) {
    return (
      <div id="nonSolidObjects">
        <div className="text-center p-4">
          <div className="text-muted">No non-solid objects found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="nonSolidObjects">
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
                      <Properties object={row.original} />
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

/*
_NonSolidObjects.propTypes = {
    sceneryId: PropTypes.string.isRequired,
};
*/
