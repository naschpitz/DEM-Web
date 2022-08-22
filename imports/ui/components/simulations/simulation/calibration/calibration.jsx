import React, { useState } from 'react';
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";

import Alert from "react-s-alert";
import ClipLoader from "react-spinners/ClipLoader";

import CalibrationControl from '../../calibrationControl/calibrationControl.jsx';
import ExperimentalData from './experimentalDataSets/experimentalData/experimentalData.jsx'

import CalibrationClass from "../../../../../api/calibrations/both/class";

import './calibration.css';

export default Calibration = (props) => {
    const [ isReady, setIsReady ] = useState(false);

    useTracker(() => {
        if (!props.simulationId)
            return;

        Meteor.subscribe('calibrations.byOwner', props.simulationId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, [ props.simulationId ]);

    const calibration = useTracker(() => {
        return CalibrationClass.findOne({owner: props.simulationId});
    });

    if (isReady) {
        if (calibration) {
            return (
                <div id="calibration">
                    <div className="card">
                        <div className="card-header">
                            <div className="panel-title">Control</div>
                        </div>

                        <div className="card-body">
                            <CalibrationControl calibrationId={calibration._id} showFields={true}/>
                        </div>
                    </div>

                    <div className="card">
                        <div className="card-header">
                            <div className="panel-title">Experimental Data Sets</div>
                        </div>

                        <div className="card-body">
                            <ExperimentalData simulationId={props.simulationId} calibrationId={calibration._id}/>
                        </div>
                    </div>
                </div>
            );
        }

        else {
            return (<div id="calibration" className="alert alert-warning" role="alert">No Calibration found.</div>)
        }
    }

    else {
        return (
            <div className="container-fluid text-center" id="calibration">
                <ClipLoader size={50} color={"#DDD"} loading={true}/>
            </div>
        );
    }
}