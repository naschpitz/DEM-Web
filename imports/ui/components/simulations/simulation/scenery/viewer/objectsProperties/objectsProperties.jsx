import React, { useEffect, useState, useMemo } from "react"
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

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import NonSolidObjectsClass from "../../../../../../../api/nonSolidObjects/both/class.js"
import ObjectsPropertiesClass from "../../../../../../../api/objectsProperties/both/class.js"
import SolidObjectsClass from "../../../../../../../api/solidObjects/both/class.js"

import Alert from "../../../../../../utils/alert.js"
import ClipLoader from "react-spinners/ClipLoader"
import Properties from "./properties/properties.jsx"

import "./objectsProperties.css"

export default (props) => {
  const [isNonSolidObjectsReady, setIsNonSolidObjectsReady] = useState(false)
  const [isSolidObjectsReady, setIsSolidObjectsReady] = useState(false)
  const [isObjectsPropertiesReady, setIsObjectsPropertiesReady] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("nonSolidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsNonSolidObjectsReady(true),
    })

    Meteor.subscribe("solidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSolidObjectsReady(true),
    })
  }, [props.sceneryId])

  const nonSolidObjects = useTracker(() => {
    return NonSolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  }, [props.sceneryId])

  const solidObjects = useTracker(() => {
    return SolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  }, [props.sceneryId])

  const objects = useMemo(() => {
    return _.concat(nonSolidObjects, solidObjects)
    }, [nonSolidObjects, solidObjects]
  )

  useTracker(() => {
    Meteor.subscribe("objectsProperties", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsObjectsPropertiesReady(true),
    })
  }, [props.sceneryId])

  const objectsProperties = useTracker(() => {
    const objects = _.concat(nonSolidObjects, solidObjects)
    const objectsIds = objects.map(object => object._id)

    return ObjectsPropertiesClass.find({ owner: { $in: objectsIds } }).fetch()
  }, [nonSolidObjects, solidObjects])

  // Create reactive data for the table
  const data = useMemo(() => {
    return objects.map(object => ({
      ...object,
      objectProperty: getObjectProperty(object._id),
    }))
  }, [objects, objectsProperties])

  useEffect(() => {
    setIsReady(isNonSolidObjectsReady && isSolidObjectsReady && isObjectsPropertiesReady)
  }, [isNonSolidObjectsReady, isSolidObjectsReady, isObjectsPropertiesReady])

  const columnHelper = createColumnHelper()

  const columns = useMemo(() => [
    columnHelper.display({
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
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
      ),
      size: 30,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      meta: { className: "text-center" },
    }),
  ], [])

  function getObjectProperty(owner) {
    return _.find(objectsProperties, { owner: owner })
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
      columnSizing: {}, // optional: initial sizes
    },
  })

  if (!isReady) {
    return (
      <div id="objectsProperties">
        <div className="text-center p-4">
          <ClipLoader size={50} color={"#DDD"} loading={true} />
          <div className="mt-2">Loading objects properties...</div>
        </div>
      </div>
    )
  }

  if (objects.length === 0) {
    return (
      <div id="objectsProperties">
        <div className="text-center p-4">
          <div className="text-muted">No objects found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="objectsProperties">
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
              <React.Fragment key={row.id}>
                <tr>
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
                      <Properties objectProperty={row.original.objectProperty} onChange={props.onChange} />
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
_ObjectsProperties.propTypes = {
    sceneryId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
*/
