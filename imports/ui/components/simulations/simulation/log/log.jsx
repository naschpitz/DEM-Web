import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import moment from "moment"
import _ from "lodash"

import Alert from "react-s-alert"
import ClipLoader from "react-spinners/ClipLoader"
import FormInput from "@naschpitz/form-input"

import SimulationsClass from "../../../../../api/simulations/both/class.js"
import SimulationsLogsClass from "../../../../../api/simulationsLogs/both/class.js"

import "./log.css"

export default Log = props => {
  const [isSimulationReady, setIsSimulationReady] = useState(false)
  const [isSimulationLogsReady, setIsSimulationLogsReady] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("simulations.simulation", props.simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationReady(true),
    })
  }, [props.simulationId])

  useTracker(() => {
    Meteor.subscribe("simulationsLogs", props.simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationLogsReady(true),
    })
  }, [props.simulationId])

  useEffect(() => {
    setIsReady(isSimulationReady && isSimulationLogsReady)
  }, [isSimulationReady, isSimulationLogsReady])

  const simulation = useTracker(() => {
    return SimulationsClass.findOne(props.simulationId)
  })

  const simulationLogs = useTracker(() => {
    return SimulationsLogsClass.find(
      {
        owner: props.simulationId,
        progress: { $exists: true },
      },
      { sort: { createdAt: -1 } }
    ).fetch()
  })

  const simulationLogsReverse = useTracker(() => {
    return SimulationsLogsClass.find({ owner: props.simulationId }, { sort: { createdAt: 1 } }).fetch()
  })

  function getPercentage() {
    const simulationLog = _.head(simulationLogs)

    if (!simulationLog) return { value: 0, text: "N/A" }

    const percentage = (simulationLog.progress.step / simulationLog.progress.totalSteps) * 100

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
    const simulationLog = _.head(simulationLogs)

    if (!simulationLog) return "N/A"

    const duration = moment.duration(simulationLog.progress.et * 1000)

    return getDuration(duration)
  }

  function getEta() {
    const simulationLog = _.head(simulationLogs)

    if (!simulationLog || simulationLog.state !== "running") return "N/A"

    const duration = moment.duration(simulationLog.progress.eta * 1000)

    return getDuration(duration)
  }

  function getState() {
    const state = _.get(simulation, "state")

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

    simulationLogsReverse.forEach(simulationLog => {
      const date = simulationLog.createdAt
      const message = simulationLog.message

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
