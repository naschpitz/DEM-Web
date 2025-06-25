import React from "react"

import "./canvas.css"

export default props => {
  function getFrameImageSrc() {
    if (props.frameImage) return "data:image/png;base64," + props.frameImage

    return ""
  }

  if (props.isRendering) {
    return (
      <div id="canvas">
        <div id="rendering" className="text-center">
          <div className="spinner-border" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="sr-only">Rendering frame...</span>
          </div>
          <p>Rendering frame...</p>
        </div>
      </div>
    )
  } else {
    return (
      <div id="canvas">
        {props.frameImage ? (
          <img className="center" src={getFrameImageSrc()} id="frame" />
        ) : (
          <img className="center" src="/images/noImg.svg" id="frame" />
        )}
      </div>
    )
  }
}
