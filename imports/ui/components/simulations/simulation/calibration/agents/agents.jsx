import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import Alert from "react-s-alert"

import Agent from "./agent/agent.jsx"

import AgentsClass from "../../../../../../api/agents/both/class"

import "./agents.css"

export default Agents = props => {
  const [isAgentsReady, setIsAgentsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("agents.list", props.calibrationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsAgentsReady(true),
    })
  }, [props.calibrationId])

  const agents = useTracker(() => {
    return AgentsClass.find({ owner: props.calibrationId }).fetch()
  })

  return (
    <div id="agents">
      <div className="card">
        <div className="card-header">
          <div className="panel-title d-flex">
            <div className="align-self-center">Agents</div>
          </div>
        </div>

        <div className="card-body">
          {_.isEmpty(agents) ? (
            <div className="alert alert-info" role="alert">
              There are no agents to be displayed.
            </div>
          ) : (
            agents.map(agent => <Agent key={agent._id} agent={agent} />)
          )}
        </div>
      </div>
    </div>
  )
}
