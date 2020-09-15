import React, { useEffect, useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import _ from "lodash";

import CamerasClass from '../../../../../../../api/cameras/both/class.js';
import FramesImagesClass from '../../../../../../../api/framesImages/both/class.js';

import Alert from 'react-s-alert';

import './canvas.css';

export default Canvas = (props) => {
    const [ isReady, setIsReady ] = useState(false);

    const actionTimer = useRef();

    useTracker(() => {
        if (!props.frame)
            return;

        Meteor.subscribe('framesImages.byOwner', props.frame._id, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, [ props.frame ]);

    useTracker(() => {
        Meteor.subscribe('cameras.camera', props.sceneryId, {
            onStop: (error) => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
            onReady: () => (setIsReady(true))
        });
    }, [ props.sceneryId ]);

    const frameImage = useTracker(() => {
        if (!props.frame)
            return;

        return FramesImagesClass.findOne({owner: props.frame._id});
    });

    const camera = useTracker(() => {
        return CamerasClass.findOne({owner: props.sceneryId});
    });

    useEffect(() => {
        if (!props.frame || !props.dimensions)
            return;

        const currentFrame = props.frame;
        const dimensions = getDimensions();

        if (actionTimer.current)
            clearTimeout(actionTimer.current);

        actionTimer.current = setTimeout(renderImage, 1000, currentFrame, dimensions);

        renderImage(currentFrame, dimensions);

        function getDimensions() {
            const width = props.dimensions.width;

            return {
                width: width - 15,
                height: (width - 15) * 9 / 16
            }
        }

        function renderImage(frame, dimensions) {
            Meteor.apply('framesImages.render', [frame._id, dimensions], (error) => {
                if (error)
                    Alert.error("Error rendering frame image: " + error.reason);
            });
        }
    }, [ props.frame, props.dimensions, camera ]);

    function getStateMessage() {
        const state = _.get(frameImage, 'state');

        switch (state) {
            case 'gatheringData':
                return "Loading Frame (gathering data)...";

            case 'rendering':
                return "Loading Frame (rendering)...";
        }

        return null;
    }

    const frameImageData = _.get(frameImage, 'data');

    function getFrameImageSrc() {
        if (frameImageData)
            return "data:image/png;base64," + frameImageData;

        return '';
    }

    if (frameImageData) {
        return (
            <div id="canvas">
                <img className="center" src={getFrameImageSrc()} id="frame"/>
                <div className="text-center">{getStateMessage()}</div>
            </div>
        );
    }

    else {
        return (
            <div id="canvas">
                <h3 className="text-center">No frame available</h3>
                <img className="center" src="/images/noImg.svg" id="frame"/>
                <div className="text-center">{getStateMessage()}</div>
            </div>
        );
    }
}

/*
_Canvas.propTypes = {
    camera: PropTypes.object,
    dimensions: PropTypes.object.isRequired,
    frame: PropTypes.object
};
*/