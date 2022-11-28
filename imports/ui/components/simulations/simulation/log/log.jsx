import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import Alert from "react-s-alert"
import ClipLoader from "react-spinners/ClipLoader"
import FormInput from "@naschpitz/form-input"

import CalibrationsClass from "../../../../../api/calibrations/both/class"
import LogsClass from "../../../../../api/logs/both/class"
import SimulationsClass from "../../../../../api/simulations/both/class"

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
    switch (props.type) {
      case "simulation":
        return SimulationsClass.findOne(props.id)
      case "calibration":
        return CalibrationsClass.findOne(props.id)
    }
  })

  const logs = useTracker(() => {
    return LogsClass.find({ owner: props.id, progress: { $exists: true } }, { sort: { createdAt: -1 } }).fetch()
  })

  const logsReverse = useTracker(() => {
    return LogsClass.find({ owner: props.id }, { sort: { createdAt: 1 } }).fetch()
  })

  function getPercentage() {
    const log = _.head(logs)

    if (!log) return { value: 0, text: "N/A" }

    const percentage = (log.progress.step / log.progress.totalSteps) * 100

    return { value: percentage, text: percentage.toFixed(3) + "%" }
  }

  function getProgressBarClassName() {
    const state = getState()
    const percentage = getPercentage()

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

  function getDuration(duration) {
    let ret = ""
    ret += duration.years() + "y "
    ret += duration.months() + "m "
    ret += duration.days() + "d "
    ret += " " + duration.hours().toString().padStart(2, "0")
    ret += ":" + duration.minutes().toString().padStart(2, "0")
    ret += ":" + duration.seconds().toString().padStart(2, "0")

    return ret
  }

  function getEt() {
    const log = _.head(logs)

    if (!log) return "N/A"

    const duration = moment.duration(log.progress.et * 1000)

    return getDuration(duration)
  }

  function getEta() {
    const log = _.head(logs)

    if (!log || log.state !== "running") return "N/A"

    const duration = moment.duration(log.progress.eta * 1000)

    return getDuration(duration)
  }

  function getState() {
    const state = _.get(object, "state")

    switch (state) {
      case "new":
        return "New"
      case "running":
        return "Running"
      case "paused":
        return "Paused"
      case "stopped":
        return "Stopped"
      case "done":
        return "Done"
    }
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

  const state = getState()
  const percentage = getPercentage()
  const progressBarClassName = getProgressBarClassName()
  const et = getEt()
  const eta = getEta()
  const logMessages = getLogMessages()

  if (isReady) {
    return (
      <div id="log">
        <div className="row">
          <div className="col-sm-4 col-md-3 col-lg-2">
            <FormInput
              label="State"
              name="state"
              value={state}
              type="field"
              subtype="string"
              size="small"
              labelSizes={{ sm: 5, md: 4, lg: 3 }}
              inputSizes={{ sm: 7, md: 8, lg: 9 }}
            />
          </div>

          <div className="col-sm-4 col-md-3 col-lg-2">
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

          <div className="col-sm-4 col-md-3 col-lg-2">
            <FormInput
              label="ET"
              name="et"
              value={et}
              type="field"
              subtype="string"
              size="small"
              labelSizes={{ sm: 4, md: 3, lg: 2 }}
              inputSizes={{ sm: 8, md: 9, lg: 10 }}
            />
          </div>

          <div className="col-sm-4 col-md-3 col-lg-2">
            <FormInput
              label="ETA"
              name="eta"
              value={eta}
              type="field"
              subtype="string"
              size="small"
              labelSizes={{ sm: 4, md: 4, lg: 3 }}
              inputSizes={{ sm: 8, md: 8, lg: 9 }}
            />
          </div>
        </div>

        <div className="row">
          <div className="col-sm-12">
            <textarea rows={10} style={{ width: "100%" }} value={logMessages} readOnly={true} />
          </div>
        </div>
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
