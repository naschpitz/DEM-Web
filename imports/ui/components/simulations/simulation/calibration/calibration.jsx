import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../../api/utils/getErrorMessage.js"
import CalibrationClass from "../../../../../api/calibrations/both/class.js"

import Alert from "../../../../utils/alert.js"
import ClipLoader from "react-spinners/ClipLoader"

import AgentsTable from "./agentsTable/agentsTable.jsx"
import CalibrationControl from "../../calibrationControl/calibrationControl.jsx"
import DataSetsCard from "./dataSetsCard/dataSetsCard.jsx"
import Log from "../log/log.jsx"
import ParametersCard from "./parametersCard/parametersCard.jsx"

import "./calibration.css"

export default props => {
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    if (!props.simulationId) return

    Meteor.subscribe("calibrations.byOwner", props.simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.simulationId])

  const calibration = useTracker(() => {
    return CalibrationClass.findOne({ owner: props.simulationId })
  })

  if (isReady) {
    if (calibration) {
      return (
        <div id="calibration">
          <div className="card addMargin">
            <div className="card-header">Control</div>

            <div className="card-body">
              <CalibrationControl calibrationId={calibration._id} showFields={true} />
            </div>
          </div>

          <div className="card addMargin">
            <div className="card-header">Log</div>

            <div className="card-body">
              <Log type="calibration" id={calibration._id} />
            </div>
          </div>

          <div className="addMargin">
            <ParametersCard calibrationId={calibration._id} />
          </div>

          <div className="addMargin">
            <DataSetsCard calibrationId={calibration._id} />
          </div>

          <div id="agentsCard" className="card addMargin">
            <div className="card-header">Agents</div>

            <div className="card-body">
              <AgentsTable calibrationId={calibration._id} />
            </div>
          </div>
        </div>
      )
    } else {
      return (
        <div id="calibration" className="alert alert-warning" role="alert">
          No Calibration found.
        </div>
      )
    }
  } else {
    return (
      <div className="container-fluid text-center" id="calibration">
        <ClipLoader size={50} color={"#DDD"} loading={true} />
      </div>
    )
  }
}
