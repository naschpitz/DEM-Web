import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import moment from 'moment';
import _ from 'lodash';

import { FaPlus } from 'react-icons/fa';
import Alert from 'react-s-alert';
import ButtonEnhanced from '@naschpitz/button-enhanced';
import Control from './simulationControl/simulationControl.jsx';
import FormInput from '@naschpitz/form-input';
import ReactTable from 'react-table-v6';

import SimulationsClass from '../../../api/simulations/both/class.js';
import SimulationsLogsClass from '../../../api/simulationsLogs/both/class.js';

import './simulations.css';

export default Simulations = (props) => {
    const [ isCreating, setIsCreating ] = useState(false);
    const [ isSimulationsLogsReady, setIsSimulationsLogsReady ] = useState(false);

    useTracker(() => {
        Meteor.subscribe('simulationsLogs.last', {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsSimulationsLogsReady(true))
        });
    }, []);

    const simulations = useTracker(() => {
        return SimulationsClass.find({}, {sort: {'createdAt': -1}}).fetch();
    });

    const simulationsLogs = useTracker(() => {
        return SimulationsLogsClass.find({progress: {$exists: true}}).fetch();
    });

    function getColumns() {
        return [{
            Header: "Name",
            accessor: 'name',
            Cell: (cellInfo) => (<FormInput name="name"
                                            value={getValue(cellInfo)}
                                            type="field"
                                            subtype="string"
                                            autoComplete={false}
                                            size="small"
                                            inputSizes={{sm: 12, md: 12, lg: 12, xl: 12}}
                                            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
            />)
        }, {
            Header: "State",
            id: 'state',
            className: 'text-center',
            accessor: (data) => {
                switch (data.state) {
                    case ('new'): return "New";
                    case ('running'): return "Running";
                    case ('paused'): return "Paused";
                    case ('stopped'): return "Stopped";
                    case ('done'): return "Done";
                }
            }
        }, {
            Header: "Progress",
            id: "progress",
            className: 'text-center',
            accessor: (data) => {
                const simulationLog = simulationsLogs.find(simulationLog => (data._id === simulationLog.owner));

                return getPercentage(data, simulationLog);
            },
            Cell: (cellInfo) => (
                <div className="progress text-center">
                    <div className={getProgressBarClassName(cellInfo.original.state, cellInfo.value)} role="progressbar" aria-valuenow={cellInfo.value.value} aria-valuemin="0"
                         aria-valuemax="100" style={{width: cellInfo.value.value + '%', color: 'black'}}>
                        {cellInfo.value.text}
                    </div>
                </div>
            )
        }, {
            Header: "Elapsed Time",
            id: "et",
            className: 'text-center',
            accessor: (data) => {
                const simulationLog = simulationsLogs.find(simulationLog => (data._id === simulationLog.owner));

                return getEt(simulationLog);
            }
        }, {
            Header: "ETA",
            id: "eta",
            className: 'text-center',
            accessor: (data) => {
                const simulationLog = simulationsLogs.find(simulationLog => (data._id === simulationLog.owner));

                return getEta(simulationLog);
            }
        }, {
            Header: "Created At",
            id: "createdAt",
            className: 'text-center',
            accessor: (data) => (data.createdAt),
            Cell: (cellInfo) => (moment(cellInfo.original.createdAt).format('L HH:mm:ss'))
        }, {
            Header: "Details",
            id: "details",
            className: 'text-center',
            Cell: (cellInfo) => (<ButtonEnhanced buttonOptions={{regularText: "Details",
                                                                 data: cellInfo,
                                                                 onClick: onDetailsClick,
                                                                 className: "btn btn-sm btn-info ml-auto mr-auto",
                                                                 type: "button"}}
            />)
        }];
    }

    function getValue(cellInfo) {
        const name = cellInfo.column.id;

        return _.get(cellInfo.original, name);
    }

    function getDuration(duration) {
        let ret = "";
        ret += duration.years() + "y ";
        ret += duration.months() + "m ";
        ret += duration.days() + "d ";
        ret += " " + duration.hours().toString().padStart(2, '0');
        ret += ":" + duration.minutes().toString().padStart(2, '0');
        ret += ":" + duration.seconds().toString().padStart(2, '0');

        return ret;
    }

    function getEt(simulationLog) {
        if (!simulationLog)
            return "N/A";

        const duration = moment.duration(simulationLog.progress.et * 1000);

        return getDuration(duration);
    }

    function getEta(simulationLog) {
        if (!simulationLog || simulationLog.state !== 'running')
            return "N/A";

        const duration = moment.duration(simulationLog.progress.eta * 1000);

        return getDuration(duration);
    }

    function getPercentage(simulation, simulationLog) {
        if (!simulationLog)
            return {value: 0, text: "N/A"};

        const percentage = (simulationLog.progress.step / simulationLog.progress.totalSteps) * 100;

        return {value: percentage, text: percentage.toFixed(3) + "%"}
    }

    function getProgressBarClassName(state, percentage) {
        let className = "progress-bar massive-font ";

        const value = percentage.value;

        if (value) {
            if (value > 66) className += "progress-bar-success ";
            else if (value > 33) className += "progress-bar-warning ";
            else className += "progress-bar-danger ";
        }

        if (state === 'running')
            className += "progress-bar-striped active";

        return className;
    }

    function onCreateDone(result, data) {
        if (!result) return;

        setIsCreating(true);

        Meteor.call('simulations.create', (error) => {
            if (error)
                Alert.error("Error creating simulation: " + error.reason);

            else
                Alert.success("Simulation successfully created.");

            setIsCreating(false);
        });
    }

    function onDetailsClick(data) {
        props.history.push("/simulations/" + data.original._id);
    }

    function onEvent(event, data, name, value) {
        const simulation = {_id: data._id};

        _.set(simulation, name, value);

        if (event === 'onBlur') {
            Meteor.call('simulations.update', simulation, (error) => {
                if (error)
                    Alert.error("Error updating simulation: " + getErrorMessage(error));
            });
        }
    }

    return (
        <div className="container" id="simulations">
            <h2 className="text-center">
                Simulations &nbsp;
                <ButtonEnhanced buttonOptions={{regularText: <FaPlus className="align-middle"/>,
                                                className: "btn btn-sm btn-success ml-auto mr-auto",
                                                isAction: isCreating,
                                                actionText: "Creating...",
                                                type: "button"}}
                                confirmationOptions={{title: "Confirm simulation creation",
                                                      text: <span>Do you really want to create a new simulation?</span>,
                                                      confirmButtonText: "Create",
                                                      confirmButtonAction: "Creating...",
                                                      cancelButtonText: "Cancel",
                                                      onDone: onCreateDone}}
                />
            </h2>

            <ReactTable data={simulations}
                        columns={getColumns()}
                        defaultPageSize={5}
                        collapseOnDataChange={false}
                        className="-striped -highlight"
                        getTdProps={() => ({style: {display: 'flex', flexDirection: 'column', justifyContent: 'center'}})}
                        SubComponent={({original}) => (<Control simulationId={original._id}/>)}
            />
        </div>
    )
}