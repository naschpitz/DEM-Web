import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage.js"
import VideosClass from "../../../../../../../../api/videos/both/class.js"

import Alert from "../../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import ReactTable from "react-table-v6"

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
  })

  function getColumns() {
    function getValue(cellInfo) {
      const name = cellInfo.column.id

      return _.get(cellInfo.original, name)
    }

    function isDisabled(cellInfo) {
      const id = cellInfo.column.id

      const state = cellInfo.original.meta.state

      if (id === "downloadButton") return state !== "done"

      if (id === "removeButton") return state === "rendering" || state === "encoding"
    }

    return [
      {
        Header: "Name",
        accessor: "name",
        Cell: cellInfo => (
          <FormInput
            name="name"
            value={getValue(cellInfo)}
            type="field"
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "State",
        id: "meta.state",
        className: "text-center",
        accessor: data => data.meta.createdAt,
        Cell: cellInfo => getState(cellInfo.original.meta.state),
      },
      {
        Header: "Created At",
        id: "meta.createdAt",
        className: "text-center",
        Cell: cellInfo => moment(cellInfo.original.meta.createdAt).format("L HH:mm:ss"),
      },
      {
        Header: "Download",
        id: "downloadButton",
        className: "text-center",
        Cell: cellInfo => (
          <ButtonEnhanced
            buttonOptions={{
              id: "btnDownload",
              disabled: isDisabled(cellInfo),
              regularText: (
                <a href={getUrl(cellInfo.original._id)} download={cellInfo.original.name} target="_parent">
                  Download
                </a>
              ),
              data: cellInfo,
              className: "btn btn-sm btn-info ml-auto mr-auto",
              type: "button",
            }}
          />
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
              disabled: isDisabled(cellInfo),
              data: cellInfo,
              className: "btn btn-sm btn-danger ml-auto mr-auto",
              isAction: getRemoving(cellInfo.original._id),
              actionText: "Removing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm video removal",
              text: (
                <span>
                  Do you really want to remove the video <strong>{cellInfo.original.name}</strong> ?
                </span>
              ),
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

  return (
    <div id="videosTable">
      <ReactTable
        data={videos}
        loading={!isReady}
        loadingText="Loading videos list..."
        columns={getColumns()}
        defaultPageSize={5}
        collapseOnDataChange={false}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
      />
    </div>
  )
}
