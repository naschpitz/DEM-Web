import React, { useEffect, useRef, useState } from 'react';
import useDeepEffect from 'use-deep-compare-effect';
import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Alert from 'react-s-alert';
import Canvas from './canvas/canvas.jsx';
import CameraControl from './cameraControl/cameraControl.jsx';
import ERD from 'element-resize-detector';
import FrameControl from './frameControl/frameControl.jsx';
import ObjectsProperties from './objectsProperties/objectsProperties.jsx';
import Video from './video/video.jsx';

import './viewer.css';

let framesImages = new Map();

export default Viewer = ({simulationId, sceneryId}) => {
    const [ currentFrameImage, setCurrentFrameImage ] = useState(null);
    const [ dimensions, setDimensions ] = useState({});
    const [ frame, setFrame ] = useState({});
    const [ isRendering, setIsRendering ] = useState(false);

    const actionTimer = useRef();

    useEffect(() => {
        const erd = ERD();

        erd.listenTo(document.getElementById('canvas'), function(element) {
            const dimensions = {
                width: element.offsetWidth,
                height: element.offsetWidth * (9 / 16)
            };

            setDimensions(dimensions);
        });
    }, []);

    useDeepEffect(() => {
        if (_.isEmpty(frame) || _.isEmpty(dimensions))
            return;

        if (actionTimer.current)
            clearTimeout(actionTimer.current);

        actionTimer.current = setTimeout(renderImage, 1000);
    }, [ dimensions ]);

    useDeepEffect(() => {
        if (!framesImages.has(frame._id))
            renderImage();
    }, [ frame ]);

    function getFrameImage() {
        return framesImages.has(frame._id) ? framesImages.get(frame._id) : currentFrameImage;
    }

    function onFrameChange(newFrame) {
        if (newFrame)
            setFrame(newFrame);

        else {
            // Invalidates all frames images.
            framesImages.clear();

            renderImage();
        }
    }

    function renderImage() {
        if (_.isEmpty(frame) || _.isEmpty(dimensions))
            return;

        setIsRendering(true);

        Meteor.apply('framesImages.render', [frame._id, dimensions], (error, result) => {
            if (error)
                Alert.error("Error rendering frame image: " + error.reason);

            else {
                framesImages.set(frame._id, result);
                setCurrentFrameImage(result);
            }

            setIsRendering(false);
        });
    }

    return (
        <div id="viewer" className="row">
            <div className="col-sm-12 col-md-8">
                <div className="row">
                    <div className="col-sm-12">
                        <Canvas frameImage={getFrameImage()} isRendering={isRendering}/>
                    </div>

                    <div className="col-sm-12">
                        <div className="card" id="video">
                            <div className="card-header">
                                Video
                            </div>

                            <div className="card-body">
                                <Video sceneryId={sceneryId}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-sm-12 col-md-4">
                <div className="card">
                    <div className="card-header">
                        Camera Control
                    </div>

                    <div className="card-body">
                        <CameraControl sceneryId={sceneryId} onChange={onFrameChange}/>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">
                        Frames Control
                    </div>

                    <div className="card-body">
                        <FrameControl sceneryId={sceneryId} onChange={onFrameChange}/>
                    </div>
                </div>

                <div className="card" id="objectsProperties">
                    <div className="card-header">
                        Objects Properties
                    </div>

                    <div className="card-body">
                        <ObjectsProperties sceneryId={sceneryId} onChange={onFrameChange}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

/*
_Viewer.propTypes = {
    sceneryId: PropTypes.string.isRequired
};
*/