import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage"
import DataSetsClass from "../../../../../../../../api/dataSets/both/class"

import Alert from "../../../../../../../utils/alert"
import Spinner from "../../../../../../spinner/spinner"

import Chart from "./chart/chart"
import DataDisplay from "./dataDisplay/dataDisplay"

import "./dataSetEvaluation.css"

export default props => {
  const [isDataSetReady, setDataSetReady] = useState(false)

  const dataSetId = props.dataSetEvaluation?.dataSet
  const chartData = {
    referenceData: props.dataSetEvaluation?.referenceData,
    simulationData: props.dataSetEvaluation?.simulationData,
    errorData: props.dataSetEvaluation?.errorData,
  }

  useTracker(() => {
    if (!dataSetId) return

    Meteor.subscribe("dataSets.dataSet", dataSetId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setDataSetReady(true),
    })
  }, [dataSetId])

  const dataSet = useTracker(() => {
    if (!dataSetId) return null

    return DataSetsClass.findOne(dataSetId)
  }, [dataSetId])

  const name = dataSet?.name
  const objectId = dataSet?.object
  const dataName = dataSet?.dataName
  const score = props.dataSetEvaluation?.score

  if (!isDataSetReady)
    return (
      <div className="container-fluid" id="scenery">
        <Spinner message="Loading data set evaluation..." />
      </div>
    )

  return (
    <div id="dataSetEvaluation">
      <div className="card">
        <div className="card-header d-flex align-items-center">Data Set Evaluation</div>

        <div className="card-body">
          <DataDisplay name={name} objectId={objectId} dataName={dataName} score={score} />

          <Chart data={chartData} />
        </div>
      </div>
    </div>
  )
}
