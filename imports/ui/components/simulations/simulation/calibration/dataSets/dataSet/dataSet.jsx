import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import SceneriesClass from "../../../../../../../api/sceneries/both/class.js"

import Alert from "react-s-alert"

import DataSelector from "./dataSelector/dataSelector.jsx"

import "./dataSet.css"

export default DataSet = props => {
  const [isCalibrationReady, setIsCalibrationReady] = useState(false)
  const [selectedData, setSelectedData] = useState(null)

  useTracker(() => {
    Meteor.subscribe("sceneries.scenery", props.dataSet.owner, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsCalibrationReady(true),
    })
  }, [props.simulationId])

  const scenery = useTracker(() => {
    return SceneriesClass.findOne({ owner: props.simulationId })
  })

  function onChange(selectedData) {
    setSelectedData(selectedData)
  }

  const sceneryId = _.get(scenery, "_id")

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
