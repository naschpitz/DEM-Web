import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage"
import CalibrationsClass from "../../../../../../../api/calibrations/both/class"
import SceneriesClass from "../../../../../../../api/sceneries/both/class"

import Alert from "../../../../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaTrashAlt } from "react-icons/fa"

import Chart from "./chart/chart"
import DataImporter from "./dataImporter/dataImporter"
import DataSelector from "./dataSelector/dataSelector"

import "./dataSet.css"

export default props => {
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

    Meteor.callAsync("dataSets.update", dataSet).catch(error => {
      Alert.error("Error: " + getErrorMessage(error))
    })
  }

  function onDataImporter(dataSet) {
    const newDataSet = {
      _id: props.dataSet._id,
      data: dataSet.data?.map(data => ({ time: data[0], value: data[1] })),
    }

    Meteor.callAsync("dataSets.update", newDataSet).catch(error => {
      Alert.error("Error: " + getErrorMessage(error))
    })
  }

  function onRemoveDataSetDone(result, data) {
    if (!result) return

    setIsRemovingDataSet(true)

    Meteor.callAsync("dataSets.remove", data)
      .then(() => {
        Alert.success("Data set successfully removed.")
      })
      .catch(error => {
        Alert.error("Error: " + getErrorMessage(error))
      })
      .finally(() => {
        setIsRemovingDataSet(false)
      })
  }

  const sceneryId = scenery?._id
  const dataSetId = props.dataSet?._id

  const name = props.dataSet?.name
  const objectId = props.dataSet?.object
  const dataName = props.dataSet?.dataName
  const startCondition = props.dataSet?.startCondition
  const startThreshold = props.dataSet?.startThreshold
  const weight = props.dataSet?.weight
  const enabled = props.dataSet?.enabled

  const importerData = props.dataSet?.data?.map(data => [data.time, data.value])
  const chartData = props.dataSet?.data

  return (
    <div id="dataSet">
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <div>Data Set</div>
          <div className="ml-auto">
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
          <DataSelector
            sceneryId={sceneryId}
            name={name}
            objectId={objectId}
            dataName={dataName}
            startCondition={startCondition}
            startThreshold={startThreshold}
            weight={weight}
            enabled={enabled}
            onData={onDataSelector}
          />

          <div className="row">
            <div className="col-sm-12 col-md-5 col-lg-3">
              <DataImporter data={importerData} onData={data => onDataImporter({ data })} />
            </div>

            <div className="col-sm-12 col-md-7 col-lg-9">
              <Chart data={chartData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
