import React from "react"
import _ from "lodash"

import { useHistory } from "react-router-dom"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import Log from "../../../log/log.jsx"

import "./agent.css"

export default Agent = props => {
  const history = useHistory()

  function onDetailsClick() {
    history.push("/simulations/" + props.agent.current.simulation)
  }

  return (
    <div id="agent">
      <div className="row">
        <div className="col-sm-1 col-md-1 col-lg-1">#{props.agent.index}</div>

        <div className="col-sm-1 col-md-1 col-lg-1">Best: {props.agent.best.bestGlobal ? "Yes" : "No"}</div>

        <div className="col-sm-4 col-md-2 col-lg-2">
          <FormInput
            label="Iteration"
            name="iteration"
            value={_.get(props.agent, "iteration")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 7, md: 6, lg: 7 }}
            inputSizes={{ sm: 5, md: 6, lg: 5 }}
          />
        </div>

        <div className="col-sm-6 col-md-6 col-lg-7">
          <Log type="simulation" id={props.agent.current.simulation} showLogMessages={false} />
        </div>

        <div className="col-sm-12 col-md-12 col-lg-1">
          <ButtonEnhanced
            buttonOptions={{
              regularText: "Details",
              onClick: onDetailsClick,
              className: "btn btn-sm btn-info ml-auto mr-auto",
              type: "button",
            }}
          />
        </div>
      </div>
    </div>
  )
}
