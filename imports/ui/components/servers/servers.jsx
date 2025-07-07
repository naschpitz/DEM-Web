import React, { useState, useMemo } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper } from "@tanstack/react-table"

import Table from "../table/table"

import getErrorMessage from "../../../api/utils/getErrorMessage"
import ServersClass from "../../../api/servers/both/class"

import { FaPlus } from "react-icons/fa"
import Alert from "../../utils/alert"
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
  const data = useMemo(() => {
    return servers.map(server => ({
      ...server,
    }))
  }, [servers])

  function onEvent(event, data, name, value) {
    const server = { _id: data._id }

    _.set(server, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("servers.update", server).catch(error => {
        Alert.error("Error updating server: " + getErrorMessage(error))
      })
    }
  }

  const columnHelper = createColumnHelper()

  const columns = useMemo(
    () => [
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
      columnHelper.accessor(row => row.createdAt, {
        id: "createdAt",
        header: "Created At",
        cell: info => moment(info.getValue()).format("L HH:mm:ss"),
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
    ],
    [isRemoving]
  )

  function onCreateDone(result) {
    if (!result) return

    setIsCreating(true)

    Meteor.callAsync("servers.create")
      .then(() => {
        Alert.success("Server successfully created.")
      })
      .catch(error => {
        Alert.error("Error creating server: " + error.reason)
      })
      .finally(() => {
        setIsCreating(false)
      })
  }

  function onRemoveDone(result, data) {
    if (!result) return

    setIsRemoving(true)

    const serverId = data._id

    Meteor.callAsync("servers.remove", serverId)
      .then(() => {
        Alert.success("Server successfully removed.")
      })
      .catch(error => {
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
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: 5,
      },
      columnSizing: {
        name: 400,
        url: 600,
        port: 150,
        createdAt: 300,
        remove: 200,
      },
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
        <Table table={table} tableId="servers" />
      )}
    </div>
  )
}
