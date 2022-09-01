import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import CalibrationsClass from "../../../../../../../api/calibrations/both/class.js"
import SceneriesClass from "../../../../../../../api/sceneries/both/class.js"

import Alert from "react-s-alert"
import FormInput from "@naschpitz/form-input"

import DataImporter from "./dataImporter/dataImporter.jsx"
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

  function onData(dataSet) {
    const dataSetId = props.dataSet?._id

    const newDataSet = {
      _id: dataSetId,
      object: dataSet.objectId,
      dataName: dataSet.dataName,
      data: dataSet.data,
    }

    Meteor.call("dataSets.update", newDataSet, error => {
      if (error) {
        Alert.error("Error: " + getErrorMessage(error))
      } else {
        Alert.success("DataSet successfully updated.")
      }
    })
  }

  const sceneryId = scenery?._id

  const data = {
    objectId: props.dataSet.object,
    dataName: props.dataSet.dataName,
    data: props.dataSet.data,
  }

  return (
    <div id="dataSet">
      <div className="card">
        <div className="card-header">
          <div className="panel-title">Data Set</div>
        </div>

        <div className="card-body">
          <DataSelector sceneryId={sceneryId} objectId={data.objectId} dataName={data.dataName} onData={onData} />
          <DataImporter data={data.data} onData={data => onData({ data })} />
        </div>
      </div>
    </div>
  )
}
