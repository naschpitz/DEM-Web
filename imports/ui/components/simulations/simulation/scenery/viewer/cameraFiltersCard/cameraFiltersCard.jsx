import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import PropTypes from "prop-types"

import Alert from "react-s-alert-v3";
import { ButtonEnhanced } from "@naschpitz/button-enhanced";
import { FaPlus } from "react-icons/fa";

import CameraFilterTable from "./cameraFiltersTable/cameraFiltersTable.jsx"

import "./cameraFiltersCard.css"

export default (props) => {
  const [isCreatingCameraFilter, setIsCreatingCameraFilter] = useState(false)

  const sceneryId = props.sceneryId

  function onCreateCameraFilterDone(result) {
    if (!result) return

    setIsCreatingCameraFilter(true)

    Meteor.callAsync("cameraFilters.create", sceneryId, error => {
      if (error) Alert.error("Error creating camera filter: " + error.reason)
      else Alert.success("Camera filter successfully created.")

      setIsCreatingCameraFilter(false)
    })
  }

  return (
    <div className="card" id="cameraFiltersCard">
      <div className="card-header d-flex align-items-center">
        <div>Camera Filters</div>

        <div className="ml-auto">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaPlus className="align-middle" />,
              className: "btn btn-sm btn-success",
              isAction: isCreatingCameraFilter,
              actionText: "Creating...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm non-solid object creation",
              text: <span>Do you really want to create a new camera filter?</span>,
              confirmButtonText: "Create",
              confirmButtonAction: "Creating...",
              cancelButtonText: "Cancel",
              onDone: onCreateCameraFilterDone,
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <CameraFilterTable sceneryId={sceneryId}/>
      </div>
    </div>
  )
}
