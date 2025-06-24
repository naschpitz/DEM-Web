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

import TablePagination from "../../../../../../table/pagination.jsx"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage.js"
import VideosClass from "../../../../../../../../api/videos/both/class.js"

import Alert from "../../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import "./table.css"

export default ({ sceneryId }) => {
  const [isReady, setIsReady] = useState(false)
  const [isRemoving, setIsRemoving] = useState(new Map())

  useTracker(() => {
    Meteor.subscribe("videos", sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [sceneryId])

  const videos = useTracker(() => {
    return VideosClass.find({ "meta.owner": sceneryId }, { sort: { createdAt: -1 } }).fetch()
  }, [sceneryId])

  // Create reactive data for the table
  const data = React.useMemo(() => {
    return videos.map(video => ({
      ...video,
    }))
  }, [videos])

  const columnHelper = createColumnHelper()

  // Helper functions for column logic
  function isDownloadDisabled(video) {
    return video.meta.state !== "done"
  }

  function isRemoveDisabled(video) {
    const state = video.meta.state
    return state === "rendering" || state === "encoding"
  }

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
    columnHelper.accessor(
      row => row.meta.state,
      {
        id: "state",
        header: "State",
        cell: info => getState(info.getValue()),
        meta: { className: "text-center" },
      }
    ),
    columnHelper.accessor(
      row => row.meta.createdAt,
      {
        id: "createdAt",
        header: "Created At",
        cell: info => moment(info.getValue()).format("L HH:mm:ss"),
        meta: { className: "text-center" },
      }
    ),
    columnHelper.display({
      id: "download",
      header: "Download",
      cell: info => (
        <ButtonEnhanced
          buttonOptions={{
            id: "btnDownload",
            disabled: isDownloadDisabled(info.row.original),
            regularText: (
              <a href={getUrl(info.row.original._id)} download={info.row.original.name} target="_parent">
                Download
              </a>
            ),
            data: info,
            className: "btn btn-sm btn-info ml-auto mr-auto",
            type: "button",
          }}
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
            disabled: isRemoveDisabled(info.row.original),
            data: info,
            className: "btn btn-sm btn-danger ml-auto mr-auto",
            isAction: getRemoving(info.row.original._id),
            actionText: "Removing...",
            type: "button",
          }}
          confirmationOptions={{
            title: "Confirm video removal",
            text: (
              <span>
                Do you really want to remove the video <strong>{info.row.original.name}</strong> ?
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

  function getState(state) {
    switch (state) {
      case "rendering":
        return "Rendering"
      case "errorRendering":
        return "Error rendering"
      case "encoding":
        return "Encoding"
      case "errorEncoding":
        return "Error encoding"
      case "done":
        return "Done"
    }
  }

  function getUrl(videoId) {
    const videoCursor = VideosClass.findOne(videoId)

    return videoCursor.link() + "?xmtok=" + Meteor.userId()
  }

  function onEvent(event, data, name, value) {
    const video = { _id: data._id }

    _.set(video, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("videos.update", video)
        .catch((error) => {
          Alert.error("Error updating video: " + getErrorMessage(error))
        })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    const videoId = data.original._id
    setRemoving(videoId, true)

    Meteor.callAsync("videos.remove", videoId)
      .then(() => {
        Alert.success("Video successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing video: " + error.reason)
      })
      .finally(() => {
        setRemoving(videoId, false)
      })
  }

  function getRemoving(videoId) {
    return isRemoving.get(videoId)
  }

  function setRemoving(videoId, value) {
    const newIsRemoving = _.cloneDeep(isRemoving)
    newIsRemoving.set(videoId, value)

    setIsRemoving(newIsRemoving)
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
      <div id="videosTable">
        <div className="text-center p-4">
          <div className="spinner-border" role="status">
            <span className="sr-only">Loading videos list...</span>
          </div>
          <div className="mt-2">Loading videos list...</div>
        </div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div id="videosTable">
        <div className="text-center p-4">
          <div className="text-muted">No videos found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="videosTable">
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
    </div>
  )
}
