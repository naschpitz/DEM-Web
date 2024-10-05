import React, { useState, useEffect } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import AgentsClass from "../../../../../../../api/agents/both/class.js"

import Alert from "react-s-alert-v3"
import ClipLoader from "react-spinners/ClipLoader"
import FormInput from "@naschpitz/form-input";

import DataSetEvaluation from "./dataSetEvaluation/dataSetEvaluation.jsx"

import "./dataSetsEvaluationsCard.css"

export default DataSetsEvaluationsCard = props => {
  const [isAgentReady, setIsAgentReady] = useState(false)
  const [selectedIteration, setSelectedIteration] = useState(null)
  const [selectedDataSetsEvaluations, setSelectedDataSetsEvaluations] = useState(null)

  useTracker(() => {
    Meteor.subscribe("agents.agent", props.agentId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentReady(true),
    })
  }, [props.agentId])

  const dataSetsEvaluationsHistory = useTracker(() => {
    const agent = AgentsClass.findOne(props.agentId)

    // Set the selected iteration to the last iteration
    if (!selectedIteration && agent?.history.length > 0)
      setSelectedIteration(agent.history[agent.history.length - 1].iteration)

    return agent.history.map(history => {
      return {
        iteration: history.iteration,
        dataSetsEvaluations: history.current.dataSetsEvaluations,
      }
    })
  }, [props.agentId])

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

  if (!isAgentReady)
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

        <div className="ml-auto">
          <FormInput
            label="Iteration"
            name="iteration"
            value={selectedIteration}
            type="dropdown"
            subtype="string"
            size="small"
            options={options}
            labelSizes={{ sm: 6, md: 8, lg: 6 }}
            inputSizes={{ sm: 6, md: 4, lg: 8 }}
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
