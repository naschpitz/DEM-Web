import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import CalibrationsClass from "../../../../../../../api/calibrations/both/class.js"
import SceneriesClass from "../../../../../../../api/sceneries/both/class.js"

import Alert from "react-s-alert"

import DataSelector from "./dataSelector/dataSelector.jsx"

import "./dataSet.css"

export default DataSet = props => {
  const [isCalibrationReady, setIsCalibrationReady] = useState(false)
  const [isSceneryReady, setIsSceneryReady] = useState(false)

  useTracker(() => {
    if (!props.dataSet) return

    Meteor.subscribe("calibrations.calibration", props.dataSet.owner, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsCalibrationReady(true),
    })
  }, [props.dataSet])

  const calibration = useTracker(() => {
    if (!props.dataSet) return null

    return CalibrationsClass.findOne(props.dataSet.owner)
  }, [props.dataSet])

  useTracker(() => {
    if (!calibration) return

    Meteor.subscribe("sceneries.byOwner", calibration.owner, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSceneryReady(true),
    })
  }, [calibration])

  const scenery = useTracker(() => {
    if (!calibration) return null

    return SceneriesClass.findOne({ owner: calibration.owner })
  }, [calibration])

  function onChange(selectedData) {
    const dataSetId = props.dataSet?._id

    Meteor.call("dataSets.changeData", dataSetId, selectedData, error => {
      if (error) {
        Alert.error("Error: " + getErrorMessage(error))
      } else {
        Alert.success("DataSet successfully changed.")
      }
    })
  }

  const sceneryId = scenery?._id

  return (
    <div id="experimentalData">
      <div className="card">
        <div className="card-header">
          <div className="panel-title">Data Set</div>
        </div>

        <div className="card-body">
          <DataSelector sceneryId={sceneryId} onChange={onChange} />
        </div>
      </div>
    </div>
  )
}
