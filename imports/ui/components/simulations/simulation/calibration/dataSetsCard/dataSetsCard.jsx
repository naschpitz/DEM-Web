import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import DataSetsClass from "../../../../../../api/dataSets/both/class.js"

import Alert from "react-s-alert-v3"
import ClipLoader from "react-spinners/ClipLoader"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaPlus } from "react-icons/fa"

import DataSet from "./dataSet/dataSet.jsx"

import "./dataSetsCard.css"

export default DataSetsCard = props => {
  const [isDataSetsReady, setIsDataSetsReady] = useState(false)
  const [isCreatingDataSet, setIsCreatingDataSet] = useState(false)

  useTracker(() => {
    Meteor.subscribe("dataSets.list", props.calibrationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsDataSetsReady(true),
    })
  }, [props.calibrationId])

  const dataSets = useTracker(() => {
    return DataSetsClass.find({ owner: props.calibrationId }).fetch()
  })

  function onCreateDataSetDone(result) {
    if (!result) return

    setIsCreatingDataSet(true)

    Meteor.call("dataSets.create", props.calibrationId, error => {
      if (error) Alert.error("Error creating data set: " + error.reason)
      else Alert.success("Data set successfully created.")

      setIsCreatingDataSet(false)
    })
  }

  if (isDataSetsReady) {
    return (
      <div id="dataSetsCard" className="card">
        <div className="card-header d-flex">
          <div className="align-self-center">Data Sets</div>
          <div className="ml-auto align-self-center">
            <ButtonEnhanced
              buttonOptions={{
                regularText: <FaPlus className="align-middle" />,
                className: "btn btn-sm btn-success",
                isAction: isCreatingDataSet,
                actionText: "Creating...",
                type: "button",
              }}
              confirmationOptions={{
                title: "Confirm data set creation",
                text: <span>Do you really want to create a new data set?</span>,
                confirmButtonText: "Create",
                confirmButtonAction: "Creating...",
                cancelButtonText: "Cancel",
                onDone: onCreateDataSetDone,
              }}
            />
          </div>
        </div>

        <div className="card-body">
          {_.isEmpty(dataSets) ? (
            <div className="alert alert-info" role="alert">
              There are no data sets to be displayed.
            </div>
          ) : (
            dataSets.map(dataSet => <DataSet key={dataSet._id} dataSet={dataSet} />)
          )}
        </div>
      </div>
    )
  } else {
    return (
      <div className="container-fluid text-center" id="scenery">
        <ClipLoader size={50} color={"#DDD"} loading={true} />
      </div>
    )
  }
}
