import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import Alert from 'react-s-alert';
import ButtonEnhanced from '@naschpitz/button-enhanced';
import FormInput from '@naschpitz/form-input';

import ServersClass from '../../../../api/servers/both/class.js';
import SimulationsClass from '../../../../api/simulations/both/class.js';

import './simulationControl.css';

export default SimulationControl = (props) => {
    const [ isStarting, setIsStarting ] = useState(false);
    const [ isPausing, setIsPausing ] = useState(false);
    const [ isStopping, setIsStopping ] = useState(false);
    const [ isResetting, setIsResetting ] = useState(false);
    const [ isRemoving, setIsRemoving ] = useState(false);
    const [ isSimulationsReady, setIsSimulationsReady ] = useState(false);
    const [ isServersReady, setIsServersReady ] = useState(false);
    const [ isReady, setIsReady ] = useState(false);

    useTracker(() => {
        Meteor.subscribe('simulations.simulation', props.simulationId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsSimulationsReady(true))
        });
    }, [ props.simulationId ]);

    useTracker(() => {
        Meteor.subscribe('servers.list', {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsServersReady(true))
        });

    }, []);

    useEffect(() => {
        setIsReady(isSimulationsReady && isServersReady);
    }, [ isSimulationsReady, isServersReady ]);

    const simulation = useTracker(() => {
        return SimulationsClass.findOne(props.simulationId);
    });

    const servers = useTracker(() => {
        return ServersClass.find({}, {sort: {'createdAt': -1}}).fetch();
    });

    function onEvent(event, name, value) {
        const newSimulation = {_id: simulation._id};

        _.set(newSimulation, name, value);

        if (event === 'onBlur' || (event === 'onChange' && name === 'server')) {
            Meteor.call('simulations.update', newSimulation, (error) => {
                if (error)
                    Alert.error("Error updating server: " + getErrorMessage(error));
            });
        }
    }

    function onSimulationStartDone(result) {
        if (!result) return;

        setIsStarting(true);

        Meteor.call('simulations.start', props.simulationId, (error) => {
            if (error)
                Alert.error("Error running simulation: " + error.reason);

            else
                Alert.success("Run order successfully issued.");

            setIsStarting(false);
        });
    }

    function onSimulationPauseDone(result) {
        if (!result) return;

        setIsPausing(true);

        Meteor.call('simulations.pause', props.simulationId, (error) => {
            if (error)
                Alert.error("Error pausing simulation: " + error.reason);

            else
                Alert.success("Pause order successfully issued.");

           setIsPausing(false);
        });

    }

    function onSimulationStopDone(result) {
        if (!result) return;

        setIsStopping(true);

        Meteor.call('simulations.stop', props.simulationId, (error) => {
            if (error)
                Alert.error("Error stopping simulation: " + error.reason);

            else
                Alert.success("Stop order successfully issued.");

            setIsStopping(false);
        });
    }

    function onSimulationResetDone(result) {
        if (!result) return;

        setIsResetting(true);

        Meteor.call('simulations.reset', props.simulationId, (error) => {
            if (error)
                Alert.error("Error resetting simulation: " + error.reason);

            else
                Alert.success("Simulation successfully reset.");

            setIsResetting(false);
        });
    }

    function onSimulationRemoveDone(result) {
        if (!result) return;

        setIsRemoving(true);

        Meteor.call('simulations.remove', props.simulationId, (error) => {
            if (error)
                Alert.error("Error removing simulation: " + error.reason);

            else
                Alert.success("Simulation successfully removed.");

            setIsRemoving(false);
        });
    }

    const showFields = props.showFields;

    const serversOptions = servers.map((server) => {
        return {value: server._id, text: server.name}
    });

    serversOptions.unshift({value: '', text: "-- Select Server --"});

    return (
        <div id="simulationControl">
            <div className="row">
                <div className="col-md-2 offset-md-1 text-center">
                    <ButtonEnhanced buttonOptions={{regularText: "Start Simulation",
                                                    className: "btn btn-sm btn-success",
                                                    isAction: isStarting,
                                                    actionText: "Starting...",
                                                    type: "button"}}
                                    confirmationOptions={{title: "Confirm start simulation",
                                                          text: <span>Do you really want to start the simulation?</span>,
                                                          confirmButtonText: "Start",
                                                          confirmButtonAction: "Starting...",
                                                          cancelButtonText: "Cancel",
                                                          onDone: onSimulationStartDone}}
                    />
                </div>

                <div className="col-md-2 text-center">
                    <ButtonEnhanced buttonOptions={{regularText: "Pause Simulation",
                                                    className: "btn btn-sm btn-info",
                                                    isAction: isPausing,
                                                    actionText: "Pausing...",
                                                    type: "button"}}
                                    confirmationOptions={{title: "Confirm pause simulation",
                                                          text: <span>Do you really want to pause the simulation?</span>,
                                                          confirmButtonText: "Pause",
                                                          confirmButtonAction: "Pausing...",
                                                          cancelButtonText: "Cancel",
                                                          onDone: onSimulationPauseDone}}
                    />
                </div>

                <div className="col-md-2 text-center">
                    <ButtonEnhanced buttonOptions={{regularText: "Stop Simulation",
                                                    className: "btn btn-sm btn-danger",
                                                    isAction: isStopping,
                                                    actionText: "Stopping...",
                                                    type: "button"}}
                                    confirmationOptions={{title: "Confirm stop simulation",
                                                          text: <span>Do you really want to stop the simulation?</span>,
                                                          confirmButtonText: "Stop",
                                                          confirmButtonAction: "Stopping...",
                                                          cancelButtonText: "Cancel",
                                                          onDone: onSimulationStopDone}}
                    />
                </div>

                <div className="col-md-2 text-center">
                    <ButtonEnhanced buttonOptions={{regularText: "Reset Simulation",
                                                    className: "btn btn-sm btn-danger",
                                                    isAction: isResetting,
                                                    actionText: "Resetting...",
                                                    type: "button"}}
                                    confirmationOptions={{title: "Confirm reset simulation",
                                                          text: <span>Do you really want to reset the simulation?</span>,
                                                          confirmButtonText: "Reset",
                                                          confirmButtonAction: "Resetting...",
                                                          cancelButtonText: "Cancel",
                                                          onDone: onSimulationResetDone}}
                    />
                </div>

                <div className="col-md-2 text-center">
                    <ButtonEnhanced buttonOptions={{regularText: "Remove Simulation",
                                                    className: "btn btn-sm btn-danger",
                                                    isAction: isRemoving,
                                                    actionText: "Removing...",
                                                    type: "button"}}
                                    confirmationOptions={{title: "Confirm remove simulation",
                                                          text: <span>
                                                                    <span>Do you really want to remove the simulation?</span>
                                                                    <br/><br/>
                                                                    <span>ALL DATA WILL BE LOST!</span>
                                                                </span>,
                                                            confirmButtonText: "Remove",
                                                            confirmButtonAction: "Removing...",
                                                            cancelButtonText: "Cancel",
                                                            onDone: onSimulationRemoveDone}}
                    />
                </div>
            </div>

            {showFields ?
                <div>
                    <hr/>

                    <div className="row">
                        <div className="col-sm-4 col-md-3 col-lg-2 offset-lg-1">
                            <FormInput key="server"
                                       label="Server"
                                       name="server"
                                       value={simulation.server}
                                       type="dropdown"
                                       subtype="string"
                                       size="small"
                                       options={serversOptions}
                                       labelSizes={{sm: 5, md: 4, lg: 3}}
                                       inputSizes={{sm: 7, md: 8, lg: 9}}
                                       onEvent={onEvent}
                            />
                        </div>

                        <div className="col-sm-4 col-md-3 col-lg-2">
                            <FormInput key="totalTime"
                                       label="Total Time"
                                       name="totalTime"
                                       value={simulation.totalTime}
                                       type="field"
                                       subtype="number"
                                       size="small"
                                       labelSizes={{sm: 5, md: 5, lg: 4}}
                                       inputSizes={{sm: 7, md: 7, lg: 8}}
                                       onEvent={onEvent}
                            />
                        </div>

                        <div className="col-sm-4 col-md-3 col-lg-2">
                            <FormInput key="timeStep"
                                       label="Time Step"
                                       name="timeStep"
                                       value={simulation.timeStep}
                                       type="field"
                                       subtype="number"
                                       size="small"
                                       labelSizes={{sm: 5, md: 5, lg: 4}}
                                       inputSizes={{sm: 7, md: 7, lg: 8}}
                                       onEvent={onEvent}
                            />
                        </div>

                        <div className="col-sm-4 col-md-3 col-lg-2">
                            <FormInput key="frameTime"
                                       label="Frame Time"
                                       name="frameTime"
                                       value={simulation.frameTime}
                                       type="field"
                                       subtype="number"
                                       size="small"
                                       labelSizes={{sm: 6, md: 6, lg: 5}}
                                       inputSizes={{sm: 6, md: 6, lg: 7}}
                                       onEvent={onEvent}
                            />
                        </div>

                        <div className="col-sm-4 col-md-3 col-lg-2">
                            <FormInput key="logTime"
                                       label="Log Time"
                                       name="logTime"
                                       value={simulation.logTime}
                                       type="field"
                                       subtype="number"
                                       size="small"
                                       labelSizes={{sm: 7, md: 7, lg: 4}}
                                       inputSizes={{sm: 5, md: 5, lg: 8}}
                                       onEvent={onEvent}
                            />
                        </div>
                    </div>
                </div> : null
            }
        </div>
    );
}