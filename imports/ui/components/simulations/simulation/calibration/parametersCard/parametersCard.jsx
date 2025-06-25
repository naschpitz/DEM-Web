import React, { useState } from "react"
import { Meteor } from "meteor/meteor"

import Alert from "../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaPlus } from "react-icons/fa"

import ParametersTable from "./parametersTable/parametersTable"

import "./parametersCard.css"

export default props => {
  const [isCreatingParameter, setIsCreatingParameter] = useState(false)

  function onCreateParameterDone(result) {
    if (!result) return

    setIsCreatingParameter(true)

    Meteor.callAsync("parameters.create", props.calibrationId)
      .then(() => {
        Alert.success("Parameter successfully created.")
      })
      .catch(error => {
        Alert.error("Error creating parameters: " + error.reason)
      })
      .finally(() => {
        setIsCreatingParameter(false)
      })
  }

  return (
    <div id="parametersCard" className="card">
      <div className="card-header d-flex">
        <div className="align-self-center">Parameters</div>
        <div className="ml-auto align-self-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaPlus className="align-middle" />,
              className: "btn btn-sm btn-success",
              isAction: isCreatingParameter,
              actionText: "Creating...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm data set creation",
              text: <span>Do you really want to create a new parameter?</span>,
              confirmButtonText: "Create",
              confirmButtonAction: "Creating...",
              cancelButtonText: "Cancel",
              onDone: onCreateParameterDone,
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <ParametersTable calibrationId={props.calibrationId} />
      </div>
    </div>
  )
}
