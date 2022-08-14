import React from 'react';

import Log from './../log/log.jsx';
import Scenery from '../scenery/scenery.jsx';
import SimulationControl from '../../simulationControl/simulationControl.jsx';

import './main.css';

export default Main = (props) => {
    const simulationId = props.simulationId;

    return (
        <div id="main">
            <div className="card">
                <div className="card-header">
                    <div className="panel-title">Control</div>
                </div>

                <div className="card-body">
                    <SimulationControl simulationId={simulationId} showFields={true}/>
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
    );
}