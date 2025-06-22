import React, { useState, useEffect } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import AgentsHistories from "../../../../../../../api/agentsHistories/both/class";

import Alert from "../../../../../../utils/alert.js"
import ClipLoader from "react-spinners/ClipLoader"
import FormInput from "@naschpitz/form-input";

import DataSetEvaluation from "./dataSetEvaluation/dataSetEvaluation.jsx"

import "./dataSetsEvaluationsCard.css"

export default (props) => {
  const [isAgentHistoriesReady, setIsAgentHistoriesReady] = useState(false)
  const [selectedIteration, setSelectedIteration] = useState(null)
  const [selectedDataSetsEvaluations, setSelectedDataSetsEvaluations] = useState(null)

  useTracker(() => {
    Meteor.subscribe("agentsHistories.byOwner", props.agentId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentHistoriesReady(true),
    })
  }, [props.agentId])

  const dataSetsEvaluationsHistory = useTracker(() => {
    const agentHistories = AgentsHistories.find({ owner: props.agentId }, { sort: { iteration: 1 }}).fetch()

    return agentHistories.map(agentHistory => {
      return {
        iteration: agentHistory.iteration,
        dataSetsEvaluations: agentHistory.current.dataSetsEvaluations,
      }
    })
  }, [props.agentId])

  useEffect(() => {
    if(!selectedIteration && dataSetsEvaluationsHistory.length > 0) {
      const lastIteration = dataSetsEvaluationsHistory[dataSetsEvaluationsHistory.length - 1].iteration

      setSelectedIteration(lastIteration)
    }
  }, [dataSetsEvaluationsHistory])

  useEffect(() => {
    // Find a history that matches the selected iteration
    const history = dataSetsEvaluationsHistory.find(history => history.iteration === Number(selectedIteration))
    const dataSetsEvaluations = history?.dataSetsEvaluations || []

    setSelectedDataSetsEvaluations(dataSetsEvaluations)
  }, [selectedIteration]);

  const options = dataSetsEvaluationsHistory?.map(dataSetsEvaluation => {
    return {
      value: dataSetsEvaluation.iteration,
      text: dataSetsEvaluation.iteration,
    }
  }) || []

  function onEvent(event, name, value) {
    setSelectedIteration(value)
  }

  if (!isAgentHistoriesReady)
    return (
      <div className="container-fluid text-center" id="scenery">
        <ClipLoader size={50} color={"#DDD"} loading={true} />
      </div>
    )

  return (
    <div id="dataSetsEvaluationsCard" className="card">
      <div className="card-header d-flex align-items-center">
        <div>
          Data Sets Evaluations
        </div>

        <div id="iterationSelector" className="ml-auto">
          <FormInput
            label="Iteration"
            name="iteration"
            value={selectedIteration}
            type="dropdown"
            subtype="string"
            size="small"
            options={options}
            labelSizes={{ sm: 6, md: 8, lg: 6 }}
            inputSizes={{ sm: 6, md: 4, lg: 6 }}
            onEvent={onEvent}
          />
        </div>
      </div>

      <div className="card-body">
        {_.isEmpty(selectedDataSetsEvaluations) ? (
          <div className="alert alert-info" role="alert">
            There are no data sets evaluations to be displayed for the selected iteration.
          </div>
        ) : (
          selectedDataSetsEvaluations.map(dataSetEvaluation =>
            <DataSetEvaluation key={dataSetEvaluation.dataSet} dataSetEvaluation={dataSetEvaluation} />
          )
        )}
      </div>
    </div>
  )
}
