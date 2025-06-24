import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table"

import TablePagination from "../table/pagination.jsx"

import getErrorMessage from "../../../api/utils/getErrorMessage"
import ServersClass from "../../../api/servers/both/class.js"

import { FaPlus } from "react-icons/fa"
import Alert from "../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import "./servers.css"

export default () => {
  const [isCreating, setIsCreating] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("servers.list", {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [])

  const servers = useTracker(() => {
    return ServersClass.find({}, { sort: { createdAt: -1 } }).fetch()
  }, [])

  // Create reactive data for the table
  const data = React.useMemo(() => {
    return servers.map(server => ({
      ...server,
    }))
  }, [servers])

  function onEvent(event, data, name, value) {
    const server = { _id: data._id }

    _.set(server, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("servers.update", server)
        .catch((error) => {
          Alert.error("Error updating server: " + getErrorMessage(error))
        })
    }
  }

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
      meta: { className: "text-center" },
    }),
    columnHelper.accessor("url", {
      header: "URL",
      cell: info => (
        <FormInput
          name="url"
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
    columnHelper.accessor("port", {
      header: "Port",
      cell: info => (
        <FormInput
          name="port"
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
    columnHelper.accessor(
      row => row.createdAt,
      {
        id: "createdAt",
        header: "Created At",
        cell: info => moment(info.getValue()).format("L HH:mm:ss"),
        meta: { className: "text-center" },
      }
    ),
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
            title: "Confirm server removal",
            text: (
              <span>
                Do you really want to remove the server <strong>{info.row.original.name}</strong> ?
              </span>
            ),
            confirmButtonText: "Remove",
            confirmButtonAction: "Removing...",
            cancelButtonText: "Cancel",
            onDone: onRemoveDone,
          }}
        />
      ),
      meta: { className: "text-center" },
    }),
  ], [isRemoving])



  function onCreateDone(result) {
    if (!result) return

    setIsCreating(true)

    Meteor.callAsync("servers.create")
      .then(() => {
        Alert.success("Server successfully created.")
      })
      .catch((error) => {
        Alert.error("Error creating server: " + error.reason)
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  function onRemoveDone(result, data) {
    if (!result) return

    setIsRemoving(true)

    const materialId = data.original._id

    Meteor.callAsync("servers.remove", materialId)
      .then(() => {
        Alert.success("Server successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing server: " + error.reason)
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
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: "onChange", // "onEnd" also supported
    initialState: {
      pagination: {
        pageSize: 5,
      },
      columnSizing: {}, // optional: initial sizes
    },
  })

  if (!isReady) {
    return (
      <div className="container" id="servers">
        <h2 className="text-center">
          Servers &nbsp;
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaPlus className="align-middle" />,
              className: "btn btn-sm btn-success",
              isAction: isCreating,
              actionText: "Creating...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm server creation",
              text: <span>Do you really want to create a new server?</span>,
              confirmButtonText: "Create",
              confirmButtonAction: "Creating...",
              cancelButtonText: "Cancel",
              onDone: onCreateDone,
            }}
          />
        </h2>
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading servers list...</span>
          </div>
          <div className="mt-2">Loading servers list...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container" id="servers">
      <h2 className="text-center">
        Servers &nbsp;
        <ButtonEnhanced
          buttonOptions={{
            regularText: <FaPlus className="align-middle" />,
            className: "btn btn-sm btn-success",
            isAction: isCreating,
            actionText: "Creating...",
            type: "button",
          }}
          confirmationOptions={{
            title: "Confirm server creation",
            text: <span>Do you really want to create a new server?</span>,
            confirmButtonText: "Create",
            confirmButtonAction: "Creating...",
            cancelButtonText: "Cancel",
            onDone: onCreateDone,
          }}
        />
      </h2>

      {servers.length === 0 ? (
        <div className="text-center p-4">
          <div className="text-muted">No servers found. Create your first server!</div>
        </div>
      ) : (
        <>
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

          <TablePagination table={table} />
        </>
      )}
    </div>
  )
}
