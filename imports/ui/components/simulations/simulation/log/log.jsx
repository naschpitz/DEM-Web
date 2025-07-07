import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import getErrorMessage from "../../../../../api/utils/getErrorMessage"
import CalibrationsClass from "../../../../../api/calibrations/both/class"
import LogsClass from "../../../../../api/logs/both/class"
import SimulationsClass from "../../../../../api/simulations/both/class"

import Alert from "../../../../utils/alert"
import FormInput from "@naschpitz/form-input"
import Spinner from "../../../spinner/spinner"
import LogTable from "./table/table"

import "./log.css"

export default props => {
  const [isObjectReady, setIsObjectReady] = useState(false)
  const [isLogsReady, setIsLogsReady] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    const getPublicationName = () => {
      switch (props.type) {
        case "simulation":
          return "simulations.simulation"
        case "calibration":
          return "calibrations.calibration"
      }
    }

    Meteor.subscribe(getPublicationName(), props.id, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsObjectReady(true),
    })
  }, [props.id])

  useTracker(() => {
    Meteor.subscribe("logs", props.id, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsLogsReady(true),
    })
  }, [props.id])

  useEffect(() => {
    setIsReady(isObjectReady && isLogsReady)
  }, [isObjectReady, isLogsReady])

  const object = useTracker(() => {
    return getObjectClass().findOne(props.id)
  })

  const logs = useTracker(() => {
    return LogsClass.find({ owner: props.id, progress: { $exists: true } }, { sort: { createdAt: -1 } }).fetch()
  })

  const allLogs = useTracker(() => {
    return LogsClass.find({ owner: props.id }, { sort: { createdAt: -1 } }).fetch()
  })

  function getObjectClass() {
    switch (props.type) {
      case "simulation":
        return SimulationsClass
      case "calibration":
        return CalibrationsClass
    }
  }

  function getProgressBarClassName(log) {
    const state = object?.state
    const percentage = LogsClass.getPercentage(log)

    let className = "progress-bar massive-font "

    const value = percentage.value

    if (value) {
      if (value > 66) className += "progress-bar-success "
      else if (value > 33) className += "progress-bar-warning "
      else className += "progress-bar-danger "
    }

    if (state === "running") className += "progress-bar-striped active"

    return className
  }

  const log = _.head(logs)

  const state = getObjectClass().getState(object)
  const percentage = LogsClass.getPercentage(log)
  const progressBarClassName = getProgressBarClassName(log)
  const et = LogsClass.getEt(log)
  const eta = LogsClass.getEta(log)

  const { showLogMessages = true } = props

  if (isReady) {
    return (
      <div id="log">
        <div id="data" className="row">
          <div className="col-sm-4 col-md-3 col-lg-3">
            <FormInput
              label="State"
              name="state"
              value={state}
              type="field"
              subtype="string"
              size="small"
              labelSizes={{ sm: 6, md: 5, lg: 3 }}
              inputSizes={{ sm: 6, md: 7, lg: 8 }}
              alignment="no-gap"
            />
          </div>

          <div className="col-sm-4 col-md-3 col-lg-3">
            <div className="progress text-center">
              <div
                className={progressBarClassName}
                role="progressbar"
                aria-valuenow={percentage.value}
                aria-valuemin="0"
                aria-valuemax="100"
                style={{ width: percentage.value + "%", color: "black" }}
              >
                {percentage.text}
              </div>
            </div>
          </div>

          <div className="col-sm-4 col-md-3 col-lg-3">
            <FormInput
              label="ET"
              name="et"
              value={et}
              type="field"
              subtype="string"
              size="small"
              labelSizes={{ sm: 4, md: 4, lg: 3 }}
              inputSizes={{ sm: 8, md: 8, lg: 9 }}
              alignment="no-gap"
            />
          </div>

          <div className="col-sm-4 col-md-3 col-lg-3">
            <FormInput
              label="ETA"
              name="eta"
              value={eta}
              type="field"
              subtype="string"
              size="small"
              labelSizes={{ sm: 4, md: 4, lg: 3 }}
              inputSizes={{ sm: 8, md: 8, lg: 9 }}
              alignment="no-gap"
            />
          </div>
        </div>

        {showLogMessages ? (
          <div id="messages" className="row">
            <div className="col-sm-12">
              <LogTable logs={allLogs} />
            </div>
          </div>
        ) : null}
      </div>
    )
  } else {
    return (
      <div id="log">
        <Spinner message="Loading log..." />
      </div>
    )
  }
}
