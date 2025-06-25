import React from "react"

import Spinner from "../../../../../spinner/spinner.jsx"

import "./canvas.css"

export default props => {
  function getFrameImageSrc() {
    if (props.frameImage) return "data:image/png;base64," + props.frameImage

    return ""
  }

  if (props.isRendering) {
    return (
      <div id="canvas">
        <div id="rendering">
          <Spinner message="Rendering frame..." />
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
