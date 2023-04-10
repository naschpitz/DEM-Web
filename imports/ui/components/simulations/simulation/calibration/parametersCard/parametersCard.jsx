import React, { useState } from "react"
import { Meteor } from "meteor/meteor"

import Alert from "react-s-alert-v3"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaPlus } from "react-icons/fa"

import ParametersTable from "./parametersTable/parametersTable"

import "./parametersCard.css"

export default ParametersCard = props => {
  const [isCreatingParameter, setIsCreatingParameter] = useState(false)

  function onCreateParameterDone(result) {
    if (!result) return

    setIsCreatingParameter(true)

    Meteor.call("parameters.create", props.calibrationId, error => {
      if (error) Alert.error("Error creating parameters: " + error.reason)
      else Alert.success("Parameter successfully created.")

      setIsCreatingParameter(false)
    })
  }

  return (
    <div id="parametersCard" className="card">
      <div className="card-header">
        <div className="panel-title d-flex">
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
      </div>

      <div className="card-body">
        <ParametersTable calibrationId={props.calibrationId} />
      </div>
    </div>
  )
}
