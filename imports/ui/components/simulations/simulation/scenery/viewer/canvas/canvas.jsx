import React from 'react';

import './canvas.css';

export default Canvas = (props) => {
    function getFrameImageSrc() {
        if (props.frameImage)
            return "data:image/png;base64," + props.frameImage;

        return '';
    }

    if (props.frameImage) {
        return (
            <div id="canvas">
                <img className="center" src={getFrameImageSrc()} id="frame"/>
                {props.isRendering ? <p className="text-center">Rendering frame...</p> : null}
            </div>
        );
    }

    else {
        return (
            <div id="canvas">
                <h3 className="text-center">No frame available</h3>
                <img className="center" src="/images/noImg.svg" id="frame"/>
            </div>
        );
    }
}