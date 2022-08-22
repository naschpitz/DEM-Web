import React, { useState } from 'react';
import { Meteor } from "meteor/meteor";
import { useTracker } from "meteor/react-meteor-data";
import _ from "lodash";

import './experimentalDataSets.css'

export default ExperimentalDataSets = (props) => {
    const [ isSceneryReady, setIsSceneryReady ] = useState(false);
    const [ selectedData, setSelectedData ] = useState(null);

    useTracker(() => {
        Meteor.subscribe('sceneries.scenery', props.simulationId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsSceneryReady(true))
        });
    } , [ props.simulationId ]);

    const scenery = useTracker(() => {
        return SceneriesClass.findOne({owner: props.simulationId});
    } );

    function onChange(selectedData) {
        setSelectedData(selectedData);
    }

    const sceneryId = _.get(scenery, '_id');

    return (
        <div id="experimentalDataSets">
            <div className="card">
                <div className="card-header">
                    <div className="panel-title">Experimental Data Sets</div>
                </div>

                <div className="card-body">
                    <DataSelector sceneryId={sceneryId} onChange={onChange}/>
                </div>
            </div>
        </div>
    );
}