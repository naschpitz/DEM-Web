import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import CalibrationsClass from "../../../../../../../api/calibrations/both/class.js"
import SceneriesClass from "../../../../../../../api/sceneries/both/class.js"

import Alert from "react-s-alert-v3"
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

  function onDataSelector(dataSelector) {
    dataSelector.object = dataSelector.objectId
    delete dataSelector.objectId

    const dataSet = {
      _id: props.dataSet._id,
      ...dataSelector,
    }

    Meteor.call("dataSets.update", dataSet, error => {
      if (error) {
        Alert.error("Error: " + getErrorMessage(error))
      }
    })
  }

  function onDataImporter(dataSet) {
    const newDataSet = {
      _id: props.dataSet._id,
      data: dataSet.data?.map(data => ({ time: data[0], value: data[1] })),
    }

    Meteor.call("dataSets.update", newDataSet, error => {
      if (error) {
        Alert.error("Error: " + getErrorMessage(error))
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
  const startCondition = props.dataSet?.startCondition
  const startThreshold = props.dataSet?.startThreshold
  const data = props.dataSet?.data?.map(data => [data.time, data.value])

  return (
    <div id="dataSet">
      <div className="card">
        <div className="card-header">
          <div className="panel-title d-flex">
            <div className="align-self-center">Data Set</div>
            <div className="ml-auto align-self-center">
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
        </div>

        <div className="card-body">
          <DataSelector
            sceneryId={sceneryId}
            objectId={objectId}
            dataName={dataName}
            startCondition={startCondition}
            startThreshold={startThreshold}
            onData={onDataSelector}
          />

          <div className="row">
            <div className="col-sm-12 col-md-5 col-lg-3">
              <DataImporter data={data} onData={data => onDataImporter({ data })} />
            </div>

            <div className="col-sm-12 col-md-7 col-lg-9">
              <Chart data={data} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
