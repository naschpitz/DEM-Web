import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import _ from "lodash"

import getErrorMessage from "../../../../api/utils/getErrorMessage.js"
import Groups from "../../../../api/groups/both/class";
import ServersClass from "../../../../api/servers/both/class.js"
import SimulationsClass from "../../../../api/simulations/both/class.js"

import { FaClone, FaPause, FaPlay, FaStop, FaSync, FaTrashAlt } from "react-icons/fa"
import Alert from "../../../utils/Alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import "./simulationControl.css"

export default (props) => {
  const [isStarting, setIsStarting] = useState(false)
  const [isPausing, setIsPausing] = useState(false)
  const [isStopping, setIsStopping] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [isCloning, setIsCloning] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)
  const [isSimulationsReady, setIsSimulationsReady] = useState(false)
  const [isGroupsReady, setIsGroupsReady] = useState(false)
  const [isServersReady, setIsServersReady] = useState(false)
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("groups.list", {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsGroupsReady(true),
    })
  }, [])

  useTracker(() => {
    Meteor.subscribe("simulations.simulation", props.simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationsReady(true),
    })
  }, [props.simulationId])

  useTracker(() => {
    Meteor.subscribe("servers.list", {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsServersReady(true),
    })
  }, [])

  useEffect(() => {
    setIsReady(isSimulationsReady && isServersReady)
  }, [isSimulationsReady, isServersReady])

  const simulation = useTracker(() => {
    return SimulationsClass.findOne(props.simulationId)
  })

  const groups = useTracker(() => {
    return Groups.find({}, { sort: { name: -1 } }).fetch()
  })

  const servers = useTracker(() => {
    return ServersClass.find({}, { sort: { name: -1 } }).fetch()
  })

  function onEvent(event, name, value) {
    if (!simulation) return

    const newSimulation = { _id: simulation._id }

    _.set(newSimulation, name, value)

    if (event === "onBlur" || (event === "onChange" && (name === "group" || name === "server" || name === "multiGPU" || name === "calcNeigh"))) {
      Meteor.callAsync("simulations.update", newSimulation)
        .catch((error) => {
          Alert.error("Error updating server: " + getErrorMessage(error))
        })
    }
  }

  function onSimulationStartDone(result) {
    if (!result) return

    setIsStarting(true)

    Meteor.callAsync("simulations.start", props.simulationId)
      .then(() => {
        Alert.success("Run order successfully issued.")
      })
      .catch((error) => {
        Alert.error("Error running simulation: " + error.reason)
      })
      .finally(() => {
        setIsStarting(false)
      })
  }

  function onSimulationPauseDone(result) {
    if (!result) return

    setIsPausing(true)

    Meteor.callAsync("simulations.pause", props.simulationId)
      .then(() => {
        Alert.success("Pause order successfully issued.")
      })
      .catch((error) => {
        Alert.error("Error pausing simulation: " + error.reason)
      })
      .finally(() => {
        setIsPausing(false)
      })
  }

  function onSimulationStopDone(result) {
    if (!result) return

    setIsStopping(true)

    Meteor.callAsync("simulations.stop", props.simulationId)
      .then(() => {
        Alert.success("Stop order successfully issued.")
      })
      .catch((error) => {
        Alert.error("Error stopping simulation: " + error.reason)
      })
      .finally(() => {
        setIsStopping(false)
      })
  }

  function onSimulationResetDone(result) {
    if (!result) return

    setIsResetting(true)

    Meteor.callAsync("simulations.reset", props.simulationId)
      .then(() => {
        Alert.success("Simulation successfully reset.")
      })
      .catch((error) => {
        Alert.error("Error resetting simulation: " + error.reason)
      })
      .finally(() => {
        setIsResetting(false)
      })
  }

  function onSimulationCloneDone(result) {
    if (!result) return

    setIsCloning(true)

    Meteor.callAsync("simulations.clone", props.simulationId)
      .then(() => {
        Alert.success("Simulation successfully cloned.")
      })
      .catch((error) => {
        Alert.error("Error cloning simulation: " + error.reason)
      })
      .finally(() => {
        setIsCloning(false)
      })
  }

  function onSimulationRemoveDone(result) {
    if (!result) return

    setIsRemoving(true)

    Meteor.callAsync("simulations.remove", props.simulationId)
      .then(() => {
        Alert.success("Simulation successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing simulation: " + error.reason)
      })
      .finally(() => {
        setIsRemoving(false)
      })
  }

  const showFields = props.showFields

  const groupsOptions = groups.map(group => {
    return { value: group._id, text: group.name }
  })

  groupsOptions.unshift({ value: "", text: "-- Select Group --" })

  const serversOptions = servers.map(server => {
    return { value: server._id, text: server.name }
  })

  serversOptions.unshift({ value: "", text: "-- Select Server --" })

  return (
    <div id="simulationControl">
      <div className="row">
        <div className="col-md-2 text-center">
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
              text: <span>Do you really want to start the simulation?</span>,
              confirmButtonText: "Start",
              confirmButtonAction: "Starting...",
              cancelButtonText: "Cancel",
              onDone: onSimulationStartDone,
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
              text: <span>Do you really want to pause the simulation?</span>,
              confirmButtonText: "Pause",
              confirmButtonAction: "Pausing...",
              cancelButtonText: "Cancel",
              onDone: onSimulationPauseDone,
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
              text: <span>Do you really want to stop the simulation?</span>,
              confirmButtonText: "Stop",
              confirmButtonAction: "Stopping...",
              cancelButtonText: "Cancel",
              onDone: onSimulationStopDone,
            }}
          />
        </div>

        <div className="col-md-2 text-center">
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
              text: <span>Do you really want to reset the simulation?</span>,
              confirmButtonText: "Reset",
              confirmButtonAction: "Resetting...",
              cancelButtonText: "Cancel",
              onDone: onSimulationResetDone,
            }}
          />
        </div>

        <div className="col-md-2 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: (
                <span>
                  <FaClone className="align-middle" /> Clone
                </span>
              ),
              className: "btn btn-sm btn-danger",
              isAction: isCloning,
              actionText: "Cloning...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm simulation clone",
              text: <span>Do you really want to clone this simulation?</span>,
              confirmButtonText: "Clone",
              confirmButtonAction: "Cloning...",
              cancelButtonText: "Cancel",
              onDone: onSimulationCloneDone,
            }}
          />
        </div>

        <div className="col-md-2 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: (
                <span>
                  <FaTrashAlt className="align-middle" /> Remove
                </span>
              ),
              className: "btn btn-sm btn-dark",
              isAction: isRemoving,
              actionText: "Removing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm remove simulation",
              text: (
                <span>
                  <span>Do you really want to remove the simulation?</span>
                  <br />
                  <br />
                  <span>ALL DATA WILL BE LOST!</span>
                </span>
              ),
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onSimulationRemoveDone,
            }}
          />
        </div>
      </div>

      {showFields ? (
        <div>
          <hr />

          <div className="row">
            <div className="col-sm-12 col-md-6 col-lg-3">
              <div className="card" id="generalSettings">
                <div className="card-header">General Settings</div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-12">
                      <FormInput
                        label="Group"
                        name="group"
                        value={_.get(simulation, "group")}
                        type="dropdown"
                        subtype="string"
                        size="small"
                        options={groupsOptions}
                        labelSizes={{ sm: 5, md: 4, lg: 4 }}
                        inputSizes={{ sm: 7, md: 8, lg: 8 }}
                        alignment="center"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-sm-12">
                      <FormInput
                        label="Server"
                        name="server"
                        value={_.get(simulation, "server")}
                        type="dropdown"
                        subtype="string"
                        size="small"
                        options={serversOptions}
                        labelSizes={{ sm: 5, md: 4, lg: 4 }}
                        inputSizes={{ sm: 7, md: 8, lg: 8 }}
                        alignment="center"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-5">
              <div className="card" id="timeSettings">
                <div className="card-header">Time Settings</div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-12 col-md-6">
                      <FormInput
                        label="Total Time"
                        name="totalTime"
                        value={_.get(simulation, "totalTime")}
                        type="field"
                        subtype="number"
                        size="small"
                        labelSizes={{ sm: 5, md: 5, lg: 6 }}
                        inputSizes={{ sm: 7, md: 7, lg: 6 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-6">
                      <FormInput
                        label="Time Step"
                        name="timeStep"
                        value={_.get(simulation, "timeStep")}
                        type="field"
                        subtype="number"
                        size="small"
                        labelSizes={{ sm: 5, md: 5, lg: 6 }}
                        inputSizes={{ sm: 7, md: 7, lg: 6 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-6">
                      <FormInput
                        label="Frame Time"
                        name="frameTime"
                        value={_.get(simulation, "frameTime")}
                        type="field"
                        subtype="number"
                        size="small"
                        labelSizes={{ sm: 5, md: 5, lg: 6 }}
                        inputSizes={{ sm: 7, md: 7, lg: 6 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-6">
                      <FormInput
                        label="Log Time"
                        name="logTime"
                        value={_.get(simulation, "logTime")}
                        type="field"
                        subtype="number"
                        size="small"
                        labelSizes={{ sm: 5, md: 5, lg: 6 }}
                        inputSizes={{ sm: 7, md: 7, lg: 6 }}
                        alignment="no-gap"
                        onEvent={onEvent}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-sm-12 col-md-4">
              <div className="card" id="calculationSettings">
                <div className="card-header">Calculation Settings</div>

                <div className="card-body">
                  <div className="row">
                    <div className="col-sm-12 col-md-12">
                      <FormInput
                        label="Calc. Neighborhood Time Interval"
                        name="calcNeighTimeInt"
                        value={_.get(simulation, "calcNeighTimeInt")}
                        type="field"
                        subtype="number"
                        size="small"
                        labelSizes={{ sm: 5, md: 5, lg: 6 }}
                        inputSizes={{ sm: 7, md: 7, lg: 6 }}
                        alignment="left"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-12">
                      <FormInput
                        label="Distance Threshold Multiplier"
                        name="neighDistThresMult"
                        value={_.get(simulation, "neighDistThresMult")}
                        type="field"
                        subtype="number"
                        size="small"
                        labelSizes={{ sm: 5, md: 5, lg: 6 }}
                        inputSizes={{ sm: 7, md: 7, lg: 6 }}
                        alignment="left"
                        onEvent={onEvent}
                      />
                    </div>

                    <div className="col-sm-12 col-md-12">
                      <FormInput
                        label="Use Multiple GPUs?"
                        name="multiGPU"
                        value={_.get(simulation, "multiGPU")}
                        type="checkbox"
                        size="small"
                        labelSizes={{ sm: 9, md: 10, lg: 10 }}
                        inputSizes={{ sm: 3, md: 2, lg: 2 }}
                        alignment="left"
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
