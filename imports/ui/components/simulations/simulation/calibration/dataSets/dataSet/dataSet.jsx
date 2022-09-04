import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import CalibrationsClass from "../../../../../../../api/calibrations/both/class.js"
import SceneriesClass from "../../../../../../../api/sceneries/both/class.js"

import Alert from "react-s-alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaTrashAlt } from "react-icons/fa"

import Chart from "./chart/chart.jsx"
import DataImporter from "./dataImporter/dataImporter.jsx"
import DataSelector from "./dataSelector/dataSelector.jsx"

import "./dataSet.css"

export default DataSet = props => {
  const [isCalibrationReady, setIsCalibrationReady] = useState(false)
  const [isSceneryReady, setIsSceneryReady] = useState(false)
  const [isRemovingDataSet, setIsRemovingDataSet] = useState(false)

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
        Alert.success("Data set successfully updated.")
      }
    })
  }

  function onRemoveDataSetDone(result, data) {
    if (!result) return

    setIsRemovingDataSet(true)

    Meteor.call("dataSets.remove", data, error => {
      if (error) {
        Alert.error("Error: " + getErrorMessage(error))
      } else {
        Alert.success("Data set successfully removed.")
      }

      setIsRemovingDataSet(false)
    })
  }

  const sceneryId = scenery?._id
  const dataSetId = props.dataSet?._id

  const objectId = props.dataSet?.object
  const dataName = props.dataSet?.dataName
  const data = props.dataSet?.data

  return (
    <div id="dataSet">
      <div className="card">
        <div className="card-header">
          <div className="panel-title">
            Data Set &nbsp;
            <ButtonEnhanced
              buttonOptions={{
                regularText: <FaTrashAlt className="align-middle" />,
                className: "btn btn-sm btn-danger",
                data: dataSetId,
                isAction: isRemovingDataSet,
                actionText: <div className="loaderSpinner loader-small" />,
                type: "button",
              }}
              confirmationOptions={{
                title: "Confirm data set removal",
                text: <span>Do you really want to remove this data set?</span>,
                confirmButtonText: "Remove",
                confirmButtonAction: "Removing...",
                cancelButtonText: "Cancel",
                onDone: onRemoveDataSetDone,
              }}
            />
          </div>
        </div>

        <div className="card-body">
          <DataSelector sceneryId={sceneryId} objectId={objectId} dataName={dataName} onData={onData} />

          <div className="row">
            <div className="col">
              <DataImporter data={data} onData={data => onData({ data })} />
            </div>

            <div className="col">
              <Chart data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
