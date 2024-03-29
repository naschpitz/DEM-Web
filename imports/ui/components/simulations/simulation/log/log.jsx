import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import CalibrationsClass from "../../../../../api/calibrations/both/class"
import LogsClass from "../../../../../api/logs/both/class"
import SimulationsClass from "../../../../../api/simulations/both/class"

import Alert from "react-s-alert-v3"
import ClipLoader from "react-spinners/ClipLoader"
import FormInput from "@naschpitz/form-input"

import "./log.css"

export default Log = props => {
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

  const logsReverse = useTracker(() => {
    return LogsClass.find({ owner: props.id }, { sort: { createdAt: 1 } }).fetch()
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

  function getLogMessages() {
    let logMessages = ""

    logsReverse.forEach(log => {
      const date = log.createdAt
      const message = log.message

      if (message) {
        logMessages += moment(date).format("L HH:mm:ss") + " - " + message + "\n"
      }
    })

    return logMessages
  }

  const log = _.head(logs)

  const state = getObjectClass().getState(object)
  const percentage = LogsClass.getPercentage(log)
  const progressBarClassName = getProgressBarClassName(log)
  const et = LogsClass.getEt(log)
  const eta = LogsClass.getEta(log)
  const logMessages = getLogMessages()

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
              <textarea rows={10} style={{ width: "100%" }} value={logMessages} readOnly={true} />
            </div>
          </div>
        ) : null}
      </div>
    )
  } else {
    return (
      <div className="text-center" id="log">
        <ClipLoader size={50} color={"#DDD"} loading={true} />
      </div>
    )
  }
}
