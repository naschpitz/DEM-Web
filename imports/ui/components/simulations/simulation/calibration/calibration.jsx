import React from 'react';

import Control from '../../simulationControl/simulationControl.jsx';
import Log from './../log/log.jsx';
import Scenery from '../scenery/scenery.jsx';

import './calibration.css';

export default Calibration = (props) => {
    const simulationId = props.simulationId;

    return (
        <div id="calibration">
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
    );
}