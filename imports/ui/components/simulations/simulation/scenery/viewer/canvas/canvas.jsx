import React from "react"

import ClipLoader from "react-spinners/ClipLoader"

import "./canvas.css"

export default (props) => {
  function getFrameImageSrc() {
    if (props.frameImage) return "data:image/png;base64," + props.frameImage

    return ""
  }

  if (props.isRendering) {
    return (
      <div id="canvas">
        <div id="rendering" className="text-center">
          <ClipLoader size={50} color={"#DDD"} loading={true} />
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
