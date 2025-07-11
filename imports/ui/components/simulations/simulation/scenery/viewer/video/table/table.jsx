import React, { useState, useMemo } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper } from "@tanstack/react-table"

import Table from "../../../../../../table/table"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage"
import VideosClass from "../../../../../../../../api/videos/both/class"

import Alert from "../../../../../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import Spinner from "../../../../../../spinner/spinner"
import FormInput from "@naschpitz/form-input"
import useIsState from "../../../../../../../hooks/useIsState"

import "./table.css"

export default ({ sceneryId }) => {
  const [isReady, setIsReady] = useState(false)
  const isRemoving = useIsState()

  useTracker(() => {
    Meteor.subscribe("videos", sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [sceneryId])

  const videos = useTracker(() => {
    return VideosClass.find({ owner: sceneryId }, { sort: { createdAt: -1 } }).fetch()
  }, [sceneryId])

  // Create reactive data for the table
  const data = useMemo(() => {
    return videos.map(video => ({
      ...video,
    }))
  }, [videos])

  const columnHelper = createColumnHelper()

  // Helper functions for column logic
  function isDownloadDisabled(video) {
    return video.state !== "done"
  }

  function isRemoveDisabled(video) {
    const state = video.state
    return state === "rendering" || state === "encoding"
  }

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
      columnHelper.accessor(row => row.state, {
        id: "state",
        header: "State",
        cell: info => getState(info.getValue()),
        meta: { className: "text-center" },
      }),
      columnHelper.accessor(row => row.createdAt, {
        id: "createdAt",
        header: "Created At",
        cell: info => moment(info.getValue()).format("L HH:mm:ss"),
        meta: { className: "text-center" },
      }),
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
              data: info.row.original,
              className: "btn btn-sm btn-danger ml-auto mr-auto",
              isAction: isRemoving.getState(info.row.original._id),
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
    ],
    [isRemoving.isState]
  )

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
    return `/files/download/${videoId}?xmtok=${Meteor.userId()}`
  }

  function onEvent(event, data, name, value) {
    const video = { _id: data._id }

    _.set(video, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("videos.update", video).catch(error => {
        Alert.error("Error updating video: " + getErrorMessage(error))
      })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    const videoId = data._id
    isRemoving.setState(videoId, true)

    Meteor.callAsync("videos.remove", videoId)
      .then(() => {
        Alert.success("Video successfully removed.")
      })
      .catch(error => {
        Alert.error("Error removing video: " + error.reason)
      })
      .finally(() => {
        isRemoving.setState(videoId, false)
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
        name: 600,
        state: 200,
        createdAt: 300,
        download: 200,
        remove: 200,
      },
    },
  })

  if (!isReady) {
    return (
      <div id="videosTable">
        <Spinner message="Loading videos list..." />
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
      <Table table={table} tableId="videosTable" />
    </div>
  )
}
