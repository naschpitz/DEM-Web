import React, { useState } from "react"
import _ from "lodash"

import Chart from "./chart/chart.jsx"
import DataExporter from "./dataExporter/dataExporter.jsx"
import DataSelector from "./dataSelector/dataSelector.jsx"

import "./charts.css"

export default (props) => {
  const [selectedData, setSelectedData] = useState(null)

  function onChange(selectedData) {
    setSelectedData(selectedData)
  }

  const sceneryId = props.sceneryId

  const objectId = _.get(selectedData, "objectId")
  const dataName = _.get(selectedData, "dataName")
  const minInterval = _.get(selectedData, "minInterval")
  const maxInterval = _.get(selectedData, "maxInterval")

  return (
    <div id="charts">
      <div id="selector" className="card">
        <div className="card-header">Selector</div>

        <div className="card-body">
          <DataSelector sceneryId={sceneryId} onChange={onChange} />
        </div>
      </div>

      {objectId && dataName ? (
        <div>
          <Chart
            sceneryId={sceneryId}
            objectId={objectId}
            dataName={dataName}
            minInterval={minInterval}
            maxInterval={maxInterval}
          />
          <DataExporter
            sceneryId={sceneryId}
            objectId={objectId}
            dataName={dataName}
            minInterval={minInterval}
            maxInterval={maxInterval}
          />
        </div>
      ) : null}
    </div>
  )
}
