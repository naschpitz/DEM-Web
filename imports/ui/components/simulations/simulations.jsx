import React, { useState } from "react"
import { Meteor } from "meteor/meteor"

import { FaPlus } from "react-icons/fa"
import Alert from "react-s-alert-v3"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import Groups from "./groups/groups.jsx"
import SimulationsTable from "./simulationsTable/simulationsTable.jsx"

import "./simulations.css"

export default Simulations = props => {
  const [isCreating, setIsCreating] = useState(false)

  function onCreateDone(result, data) {
    if (!result) return

    setIsCreating(true)

    Meteor.call("simulations.create", error => {
      if (error) Alert.error("Error creating simulation: " + error.reason)
      else Alert.success("Simulation successfully created.")

      setIsCreating(false)
    })
  }

  return (
    <div className="container" id="simulations">
      <h2 className="text-center">
        Simulations &nbsp;
        <ButtonEnhanced
          buttonOptions={{
            regularText: <FaPlus className="align-middle" />,
            className: "btn btn-sm btn-success ml-auto mr-auto",
            isAction: isCreating,
            actionText: "Creating...",
            type: "button",
          }}
          confirmationOptions={{
            title: "Confirm simulation creation",
            text: <span>Do you really want to create a new simulation?</span>,
            confirmButtonText: "Create",
            confirmButtonAction: "Creating...",
            cancelButtonText: "Cancel",
            onDone: onCreateDone,
          }}
        />
      </h2>

      <SimulationsTable />
      <br/>
      <hr  />
      <Groups />
    </div>
  )
}
