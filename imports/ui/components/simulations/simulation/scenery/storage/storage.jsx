import React, { useState } from "react"
import { Meteor } from "meteor/meteor"

import Alert from "../../../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import Spinner from "../../../../spinner/spinner"

import "./storage.css"

export default ({ scenery }) => {
  const [isMoving, setIsMoving] = useState(false)

  function onMoveDone(result) {
    if (!result) return

    setIsMoving(true)

    const newStorage = getNewStorage()

    Meteor.apply("sceneries.setStorage", [scenery._id, newStorage], { noRetry: true }, error => {
      if (error) Alert.error("Error moving to " + getStorageText(newStorage) + ": " + error.reason)

      setIsMoving(false)
    })
  }

  function getStorageText(storage) {
    switch (storage) {
      case "local":
        return "Local"
      case "s3":
        return "S3"
    }
  }

  function getNewStorage() {
    return scenery.storage === "local" ? "s3" : "local"
  }

  if (scenery) {
    const currentStorageText = getStorageText(scenery.storage)
    const newStorageText = getStorageText(getNewStorage())

    return (
      <div id="storage" className="text-center">
        <p>
          Current Storage: <strong>{currentStorageText}</strong>
        </p>
        <ButtonEnhanced
          buttonOptions={{
            regularText: (
              <span>
                Move to <strong>{newStorageText}</strong>
              </span>
            ),
            className: "btn btn-sm btn-danger",
            isAction: isMoving,
            actionText: "Moving to " + newStorageText + "...",
            type: "button",
          }}
          confirmationOptions={{
            title: "Confirm non-solid object creation",
            text: (
              <span>
                Do you really want to move from <strong>{currentStorageText}</strong> to{" "}
                <strong>{newStorageText}</strong> ?
              </span>
            ),
            confirmButtonText: "Move",
            confirmButtonAction: "Moving...",
            cancelButtonText: "Cancel",
            onDone: onMoveDone,
          }}
        />
      </div>
    )
  } else {
    return (
      <div className="container-fluid" id="storage">
        <Spinner message="Loading storage..." />
      </div>
    )
  }
}

/*
Storage.propTypes = {
    sceneryId: PropTypes.string.isRequired,
};
*/
