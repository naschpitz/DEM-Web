import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import SimulationsClass from '../../../../api/simulations/both/class.js';

import Alert from 'react-s-alert';
import ClipLoader from 'react-spinners/ClipLoader';
import Control from '../simulationControl/simulationControl.jsx';
import Log from './log/log.jsx';
import Scenery from './scenery/scenery.jsx';

import './simulation.css';

export default Simulation = (props) => {
    const [ isReady, setIsReady ] = useState(false);

    const simulationId = props.match.params.simulationId;

    useTracker(() => {
        Meteor.subscribe('simulations.simulation', simulationId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, [ simulationId ]);

    const simulation = useTracker(() => {
        return SimulationsClass.findOne(simulationId);
    });

    useEffect(() => {
        if (isReady && !simulation)
            props.history.push('/simulations');
    }, [ isReady, simulation ]);

    const name = _.get(simulation, 'name');

    if (isReady) {
        return (
            <div className="container-fluid" id="simulation">
                <div>
                    <h2 className="text-center">{name}</h2>

                    <div className="card">
                        <div className="card-header">
                            <div className="panel-title">Control</div>
                        </div>

                        <div className="card-body">
                            <Control simulationId={simulationId} showFields={true}/>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="panel-title">Log</div>
                        </div>

                        <div className="card-body">
                            <Log simulationId={simulationId}/>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="panel-title">Scenery</div>
                        </div>

                        <div className="card-body">
                            <Scenery simulationId={simulationId}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    else {
        return (
            <div className="container-fluid text-center" id="simulation">
                <ClipLoader size={50} color={"#DDD"} loading={true}/>
            </div>
        );
    }
}