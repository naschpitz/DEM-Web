import React, { useState } from 'react';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Alert from 'react-s-alert';
import { ButtonEnhanced } from '@naschpitz/button-enhanced';
import FormInput from '@naschpitz/form-input';
import Table from './table/table.jsx';

import './video.css';

export default Video = ({sceneryId}) => {
    const [ settings, setSettings ] = useState({
        dimensions: {
            width: 1920,
            height: 1080
        },
        frameRate: 30
    });

    function onEvent(event, name, value) {
        if (event !== 'onBlur')
            return;

        const newSettings = _.cloneDeep(settings);

        _.set(newSettings, name, value);

        setSettings(newSettings);
    }

    function onRenderDone(result) {
        if (!result)
            return;

        Meteor.apply('videos.render', [sceneryId, settings], {noRetry: true}, (error) => {
            if (error)
                Alert.error("Error rendering video: " + error.reason);

            else
                Alert.success("Video render order successfully issued.");
        });
    }

    return (
        <div id="video">
            <div className="row">
                <div className="col-sm-6 col-md-6 col-lg-3">
                    <FormInput label="Width"
                               name="dimensions.width"
                               value={_.get(settings, "dimensions.width")}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 6, lg: 6}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>

                <div className="col-sm-6 col-md-6 col-lg-3">
                    <FormInput label="Height"
                               name="dimensions.height"
                               value={_.get(settings, "dimensions.height")}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 6, lg: 6}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>

                <div className="col-sm-6 col-md-6 col-lg-3">
                    <FormInput label="Frame rate"
                               name="frameRate"
                               value={_.get(settings, "frameRate")}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 6, lg: 6}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>

                <div className="col-sm-6 col-md-6 col-lg-3 text-center">
                    <ButtonEnhanced buttonOptions={{regularText: "Render",
                                                    className: "btn btn-sm btn-success ml-auto mr-auto",
                                                    type: "button"}}
                                    confirmationOptions={{title: "Confirm server removal",
                                                          text: <span>Do you really want to render a new video?</span>,
                                                          confirmButtonText: "Render",
                                                          cancelButtonText: "Cancel",
                                                          onDone: onRenderDone}}
                    />
                </div>
            </div>

            <div className="row">
                <div className="col-sm-6 col-md-6 col-lg-3">
                    <FormInput label="Initial frame"
                               name="initialFrame"
                               value={_.get(settings, "initialFrame")}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 6, lg: 6}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>

                <div className="col-sm-6 col-md-6 col-lg-3">
                    <FormInput label="Final frame"
                               name="finalFrame"
                               value={_.get(settings, "finalFrame")}
                               type="field"
                               subtype="number"
                               size="small"
                               labelSizes={{sm: 6, md: 6, lg: 6}}
                               inputSizes={{sm: 6, md: 6, lg: 6}}
                               onEvent={onEvent}
                    />
                </div>
            </div>

            <Table sceneryId={sceneryId}/>
        </div>
    );
}