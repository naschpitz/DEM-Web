import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../api/utils/getErrorMessage.js"
import SimulationsClass from "../../../api/simulations/both/class.js"

import { FaPlus } from "react-icons/fa"
import Alert from "../../utils/Alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import Groups from "./groups/groups.jsx"
import SimulationsTable from "./simulationsTable/simulationsTable.jsx"

import "./simulations.css"

export default () => {
  const [isCreating, setIsCreating] = useState(false)
  const [isSimulationsReady, setIsSimulationsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("simulations.byGroup", {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationsReady(true),
    })
  }, [])

  const simulationsIds = useTracker(() => {
    return SimulationsClass
      .find({ primary: true, group: { $exists: false } }, { sort: { createdAt: -1 } })
      .map(simulation => simulation._id)
  })

  function onCreateDone(result, data) {
    if (!result) return

    setIsCreating(true)

    Meteor.callAsync("simulations.create")
      .then(() => {
        Alert.success("Simulation successfully created.")
      })
      .catch((error) => {
        Alert.error("Error creating simulation: " + error.reason)
      })
      .finally(() => {
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

      <div id="group" className="card">
        <div className="card-header d-flex">
          Ungrouped Simulations
        </div>

        <div className="card-body">
          <SimulationsTable simulationsIds={simulationsIds}/>
        </div>
      </div>
      <hr/>
      <Groups />
    </div>
  )
}
