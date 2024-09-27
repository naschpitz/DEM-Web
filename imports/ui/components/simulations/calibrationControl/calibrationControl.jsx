import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import CalibrationClass from "../../../../api/calibrations/both/class.js"
import ServersClass from "../../../../api/servers/both/class.js"

import Alert from "react-s-alert-v3"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaPause, FaPlay, FaStop, FaSync } from "react-icons/fa"
import FormInput from "@naschpitz/form-input"

import "./calibrationControl.css"

export default CalibrationControl = props => {
  const [isStarting, setIsStarting] = useState(false)
  const [isPausing, setIsPausing] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isCalibrationsReady, setIsCalibrationsReady] = useState(false)
  const [isServersReady, setIsServersReady] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    if (!props.calibrationId) return

    Meteor.subscribe("calibrations.calibration", props.calibrationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsCalibrationsReady(true),
    })
  }, [props.calibrationId])

  useTracker(() => {
    Meteor.subscribe("servers.list", {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsServersReady(true),
    })
  }, [])

  useEffect(() => {
    setIsReady(isCalibrationsReady && isServersReady)
  }, [isCalibrationsReady, isServersReady])

  const calibration = useTracker(() => {
    return CalibrationClass.findOne(props.calibrationId)
  })

  const servers = useTracker(() => {
    return ServersClass.find({}, { sort: { createdAt: -1 } }).fetch()
  })

  function onEvent(event, name, value) {
    if (!calibration) return

    const newCalibration = { _id: calibration._id }

    _.set(newCalibration, name, value)

    if (event === "onBlur" || (event === "onChange" && name === "server")) {
      Meteor.call("calibrations.update", newCalibration, error => {
        if (error) Alert.error("Error updating server: " + getErrorMessage(error))
      })
    }
  }

  function onCalibrationStartDone(result) {
    if (!result) return

    setIsStarting(true)

    Meteor.call("calibrations.start", props.calibrationId, error => {
      if (error) Alert.error("Error running calibration: " + error.reason)
      else Alert.success("Run order successfully issued.")

      setIsStarting(false)
    })
  }

  function onCalibrationPauseDone(result) {
    if (!result) return

    setIsPausing(true)

    Meteor.call("calibrations.pause", props.calibrationId, error => {
      if (error) Alert.error("Error pausing calibration: " + error.reason)
      else Alert.success("Pause order successfully issued.")

      setIsPausing(false)
    })
  }

  function onCalibrationStopDone(result) {
    if (!result) return

    setIsStopping(true)

    Meteor.call("calibrations.stop", props.calibrationId, error => {
      if (error) Alert.error("Error stopping calibration: " + error.reason)
      else Alert.success("Stop order successfully issued.")

      setIsStopping(false)
    })
  }

  function onCalibrationResetDone(result) {
    if (!result) return

    setIsResetting(true)

    Meteor.call("calibrations.reset", props.calibrationId, error => {
      if (error) Alert.error("Error resetting calibration: " + error.reason)
      else Alert.success("Calibration successfully reset.")

      setIsResetting(false)
    })
  }

  const showFields = props.showFields

  const serversOptions = new Map(
    servers.map(server => {
      return [server._id, server.name]
    })
  )

  serversOptions.set("", "-- Select Server --")

  return (
    <div id="calibrationControl">
      <div className="row">
        <div className="col-md-2 ml-md-auto text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: (
                <span>
                  <FaPlay className="align-middle" /> Play
                </span>
              ),
              className: "btn btn-sm btn-success",
              isAction: isStarting,
              actionText: "Starting...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm start simulation",
              text: <span>Do you really want to start the calibration?</span>,
              confirmButtonText: "Start",
              confirmButtonAction: "Starting...",
              cancelButtonText: "Cancel",
              onDone: onCalibrationStartDone,
            }}
          />
        </div>

        <div className="col-md-2 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: (
                <span>
                  <FaPause className="align-middle" /> Pause
                </span>
              ),
              className: "btn btn-sm btn-info",
              isAction: isPausing,
              actionText: "Pausing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm pause simulation",
              text: <span>Do you really want to pause the calibration?</span>,
              confirmButtonText: "Pause",
              confirmButtonAction: "Pausing...",
              cancelButtonText: "Cancel",
              onDone: onCalibrationPauseDone,
            }}
          />
        </div>

        <div className="col-md-2 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: (
                <span>
                  <FaStop className="align-middle" /> Stop
                </span>
              ),
              className: "btn btn-sm btn-danger",
              isAction: isStopping,
              actionText: "Stopping...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm stop simulation",
              text: <span>Do you really want to stop the calibration?</span>,
              confirmButtonText: "Stop",
              confirmButtonAction: "Stopping...",
              cancelButtonText: "Cancel",
              onDone: onCalibrationStopDone,
            }}
          />
        </div>

        <div className="col-md-2 mr-md-auto text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: (
                <span>
                  <FaSync className="align-middle" /> Reset
                </span>
              ),
              className: "btn btn-sm btn-danger",
              isAction: isResetting,
              actionText: "Resetting...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm reset simulation",
              text: <span>Do you really want to reset the calibration?</span>,
              confirmButtonText: "Reset",
              confirmButtonAction: "Resetting...",
              cancelButtonText: "Cancel",
              onDone: onCalibrationResetDone,
            }}
          />
        </div>
      </div>

      {showFields ? (
        <div>
          <hr />

          <div className="row">
            <div className="col-sm-6 col-md-6 col-lg-3">
              <div className="card" id="generalSettings">
                <div className="card-header">Server Settings</div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-12">
                      <FormInput
                        label="Server"
                        name="server"
                        value={_.get(calibration, "server")}
                        type="dropdown"
                        subtype="string"
                        size="small"
                        options={serversOptions}
                        search={false}
                        labelSizes={{ sm: 5, md: 4, lg: 4 }}
                        inputSizes={{ sm: 7, md: 8, lg: 8 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-6 col-lg-4">
              <div className="card" id="agentsSettings">
                <div className="card-header">Agents Settings</div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-12 col-md-6 col-lg-6">
                      <FormInput
                        label="# Agents"
                        name="agentsNumber"
                        value={_.get(calibration, "agentsNumber")}
                        type="field"
                        subtype="number"
                        allowNegative={false}
                        size="small"
                        labelSizes={{ sm: 5, md: 6, lg: 6 }}
                        inputSizes={{ sm: 7, md: 6, lg: 6 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-6 col-lg-6">
                      <FormInput
                        label="# Instances"
                        name="instancesNumber"
                        value={_.get(calibration, "instancesNumber")}
                        type="field"
                        subtype="number"
                        allowNegative={false}
                        size="small"
                        labelSizes={{ sm: 5, md: 6, lg: 6 }}
                        inputSizes={{ sm: 7, md: 6, lg: 6 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-md-6 col-lg-5">
              <div className="card" id="agentsSettings">
                <div className="card-header">Stop Conditions</div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-12 col-md-6 col-lg-6">
                      <FormInput
                        label="Max. Iterations"
                        name="maxIterations"
                        value={_.get(calibration, "maxIterations")}
                        type="field"
                        subtype="number"
                        allowNegative={false}
                        size="small"
                        labelSizes={{ sm: 5, md: 6, lg: 7 }}
                        inputSizes={{ sm: 7, md: 6, lg: 5 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-6 col-lg-6">
                      <FormInput
                        label="Max. Energy"
                        name="maxEnergy"
                        value={_.get(calibration, "maxEnergy")}
                        type="field"
                        subtype="number"
                        allowNegative={false}
                        size="small"
                        labelSizes={{ sm: 5, md: 6, lg: 7 }}
                        inputSizes={{ sm: 7, md: 6, lg: 5 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>

                  < hr />

                  {/*<div className="row mb-3">*/}
                  {/*  <div className="col-sm-12 col-md-12 col-lg-12">*/}
                  {/*    <div className="text-justify ">*/}
                  {/*      Number of iterations to be considered when checking for smaller scores in between iterations.*/}
                  {/*      Each iteration is compared to the previous one, and if the score is smaller by the min. percentage,*/}
                  {/*      the calibration stops.*/}
                  {/*    </div>*/}
                  {/*  </div>*/}
                  {/*</div>*/}

                  <div className="row">
                    <div className="col-sm-12 col-md-6 col-lg-6">
                      <FormInput
                        label="Num. Intervals"
                        name="numIntervals"
                        value={_.get(calibration, "numIntervals")}
                        type="field"
                        subtype="number"
                        allowNegative={false}
                        size="small"
                        labelSizes={{ sm: 5, md: 6, lg: 7 }}
                        inputSizes={{ sm: 7, md: 6, lg: 5 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-6 col-lg-6">
                      <FormInput
                        label="Min. Percentage"
                        name="minPercentage"
                        value={_.get(calibration, "minPercentage")}
                        type="field"
                        subtype="percent"
                        append="%"
                        allowNegative={false}
                        size="small"
                        labelSizes={{ sm: 5, md: 6, lg: 7 }}
                        inputSizes={{ sm: 7, md: 6, lg: 5 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
