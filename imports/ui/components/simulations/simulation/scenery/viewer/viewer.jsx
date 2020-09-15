import React, { useState } from 'react';
import PropTypes from 'prop-types';

import Canvas from './canvas/canvas.jsx';
import CameraControl from './cameraControl/cameraControl.jsx';
import ContainerDimensions from 'react-container-dimensions';
import FrameControl from './frameControl/frameControl.jsx';
import ObjectsProperties from './objectsProperties/objectsProperties.jsx';

import './viewer.css';

export default Viewer = ({sceneryId}) => {
    const [ frame, setFrame ] = useState({});

    function onFrameChange(frame) {
        setFrame(frame);
    }

    return (
        <div id="viewer" className="row">
            <div className="col-sm-12 col-md-8">
                <ContainerDimensions>
                    {(dimensions) => (<Canvas sceneryId={sceneryId} frame={frame} dimensions={dimensions}/>)}
                </ContainerDimensions>
            </div>

            <div className="col-sm-12 col-md-4">
                <div className="card">
                    <div className="card-header">
                        Camera Control
                    </div>
                    <div className="card-body">
                        <CameraControl sceneryId={sceneryId}/>
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