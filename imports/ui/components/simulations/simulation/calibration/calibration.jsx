import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../../api/utils/getErrorMessage"
import CalibrationClass from "../../../../../api/calibrations/both/class"

import Alert from "../../../../utils/alert"
import Spinner from "../../../spinner/spinner"

import AgentsTable from "./agentsTable/agentsTable"
import CalibrationControl from "../../calibrationControl/calibrationControl"
import DataSetsCard from "./dataSetsCard/dataSetsCard"
import Log from "../log/log"
import ParametersCard from "./parametersCard/parametersCard"

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
      <div className="container-fluid" id="calibration">
        <Spinner message="Loading calibration..." />
      </div>
    )
  }
}
