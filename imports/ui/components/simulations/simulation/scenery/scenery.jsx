import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import _ from 'lodash';

import SceneriesClass from '../../../../../api/sceneries/both/class.js';

import { FaPlus } from 'react-icons/fa';
import Alert from 'react-s-alert';
import ButtonEnhanced from  '@naschpitz/button-enhanced';
import Charts from './charts/charts.jsx';
import ClipLoader from 'react-spinners/ClipLoader';
import FormInput from '@naschpitz/form-input';
import Materials from './materials/materials.jsx';
import NonSolidObjects from './nonSolidObjects/nonSolidObjects.jsx';
import SolidObjects from './solidObjects/solidObjects.jsx';
import Viewer from './viewer/viewer.jsx';

import './scenery.css';

export default Scenery = (props) => {
    const [ isCreatingMaterial, setIsCreatingMaterial ] = useState(false);
    const [ isCreatingNSO, setIsCreatingNSO ] = useState(false);
    const [ isCreatingSO, setIsCreatingSO ] = useState(false);
    const [ isSceneryReady, setIsSceneryReady ] = useState(false);

    useTracker(() => {
        Meteor.subscribe('sceneries.scenery', props.simulationId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsSceneryReady(true))
        });
    }, [ props.simulationId ]);

    const scenery = useTracker(() => {
        return SceneriesClass.findOne({owner: props.simulationId});
    });

    function onEvent(event, name, value) {
        const newScenery = {_id: scenery._id};

        _.set(newScenery, name, value);

        Meteor.call('sceneries.update', newScenery, (error) => {
            if (error)
                Alert.error("Error saving scenery: " + error.reason);
        })
    }

    function onCreateNSODone(result) {
        if (!result) return;

        setIsCreatingNSO(true);

        Meteor.call('nonSolidObjects.create', scenery._id, (error) => {
            if (error)
                Alert.error("Error creating non-solid object: " + error.reason);

            else
                Alert.success("Non-solid object successfully created.");

            setIsCreatingNSO(false);
        });
    }

    function onCreateSODone(result) {
        if (!result) return;

        setIsCreatingSO(true);

        Meteor.call('solidObjects.create', scenery._id, (error) => {
            if (error)
                Alert.error("Error creating solid object: " + error.reason);

            else
                Alert.success("Solid object successfully created.");

            setIsCreatingSO(false);
        });
    }

    function onCreateMaterialDone(result) {
        if (!result) return;

        setIsCreatingMaterial(true);

        Meteor.call('materials.create', scenery._id, (error) => {
            if (error)
                Alert.error("Error creating material: " + error.reason);

            else
                Alert.success("Material successfully created.");

            setIsCreatingMaterial(false);
        });
    }

    const sceneryId = _.get(scenery, '_id');

    if (isSceneryReady) {
        return (
            <div id="scenery">
                <div className="row">
                    <div className="col-sm-12 col-md-12 col-lg-2">
                        <div className="card">
                            <div className="card-header">
                                Gravity
                            </div>

                            <div className="card-body">
                                <FormInput key="gravity[0]"
                                           label="Gx"
                                           name="gravity[0]"
                                           value={_.get(scenery, "gravity[0]")}
                                           type="field"
                                           subtype="number"
                                           size="small"
                                           labelSizes={{xs: 12, sm: 5, md: 4, lg: 3}}
                                           inputSizes={{xs: 12, sm: 7, md: 8, lg: 9}}
                                           onEvent={onEvent}
                                />

                                <FormInput key="gravity[1]"
                                           label="Gy"
                                           name="gravity[1]"
                                           value={_.get(scenery, "gravity[1]")}
                                           type="field"
                                           subtype="number"
                                           size="small"
                                           labelSizes={{xs: 12, sm: 5, md: 4, lg: 3}}
                                           inputSizes={{xs: 12, sm: 7, md: 8, lg: 9}}
                                           onEvent={onEvent}
                                />

                                <FormInput key="gravity[2]"
                                           label="Gz"
                                           name="gravity[2]"
                                           value={_.get(scenery, "gravity[2]")}
                                           type="field"
                                           subtype="number"
                                           size="small"
                                           labelSizes={{xs: 12, sm: 5, md: 4, lg: 3}}
                                           inputSizes={{xs: 12, sm: 7, md: 8, lg: 9}}
                                           onEvent={onEvent}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-12 col-md-12 col-lg-5">
                        <div className="card" id="nonSolidObjects">
                            <div className="card-header">
                                Non-Solid Objects &nbsp;
                                <ButtonEnhanced buttonOptions={{regularText: <FaPlus className="align-middle"/>,
                                                                className: "btn btn-sm btn-success",
                                                                isAction: isCreatingNSO,
                                                                actionText: "Creating...",
                                                                type: "button"}}
                                                confirmationOptions={{title: "Confirm non-solid object creation",
                                                                      text: <span>Do you really want to create a new non-solid object?</span>,
                                                                      confirmButtonText: "Create",
                                                                      confirmButtonAction: "Creating...",
                                                                      cancelButtonText: "Cancel",
                                                                      onDone: onCreateNSODone}}
                                />
                            </div>

                            <div className="card-body">
                                <NonSolidObjects sceneryId={sceneryId}/>
                            </div>
                        </div>
                    </div>

                    <div className="col-sm-12 col-md-12 col-lg-5">
                        <div className="card" id="solidObjects">
                            <div className="card-header">
                                Solid Objects &nbsp;
                                <ButtonEnhanced buttonOptions={{regularText: <FaPlus className="align-middle"/>,
                                                                className: "btn btn-sm btn-success",
                                                                isAction: isCreatingSO,
                                                                actionText: "Creating...",
                                                                type: "button"}}
                                                confirmationOptions={{title: "Confirm solid object creation",
                                                                      text: <span>Do you really want to create a new solid object?</span>,
                                                                      confirmButtonText: "Create",
                                                                      confirmButtonAction: "Creating...",
                                                                      cancelButtonText: "Cancel",
                                                                      onDone: onCreateSODone}}
                                />
                            </div>

                            <div className="card-body">
                                <SolidObjects sceneryId={sceneryId}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="col">
                        <div className="card" id="materials">
                            <div className="card-header">
                                Materials &nbsp;
                                <ButtonEnhanced buttonOptions={{regularText: <FaPlus className="align-middle"/>,
                                                                className: "btn btn-sm btn-success",
                                                                isAction: isCreatingMaterial,
                                                                actionText: "Creating...",
                                                                type: "button"}}
                                                confirmationOptions={{title: "Confirm material creation",
                                                                      text: <span>Do you really want to create a new material?</span>,
                                                                      confirmButtonText: "Create",
                                                                      confirmButtonAction: "Creating...",
                                                                      cancelButtonText: "Cancel",
                                                                      onDone: onCreateMaterialDone}}
                                />
                            </div>

                            <div className="card-body">
                                <Materials sceneryId={sceneryId}/>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        Viewer
                    </div>

                    <div className="card-body">
                        <Viewer sceneryId={sceneryId}/>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        Charts
                    </div>

                    <div className="card-body">
                        <Charts sceneryId={sceneryId}/>
                    </div>
                </div>
            </div>
        );
    }

    else {
        return (
            <div className="container-fluid text-center" id="scenery">
                <ClipLoader size={50} color={"#DDD"} loading={true}/>
            </div>
        );
    }
}