import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import FramesClass from "../../../../../../../api/frames/both/class.js"

import { FaFastBackward, FaStepBackward, FaStepForward, FaFastForward } from "react-icons/fa"
import Alert from "../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"

import "./frameControl.css"

export default props => {
  const [isReady, setIsReady] = useState(false)
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0)

  useTracker(() => {
    Meteor.subscribe("frames", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const frames = useTracker(() => {
    return FramesClass.find({ owner: props.sceneryId, detailed: true }, { sort: { step: 1 } }).fetch()
  })

  useEffect(() => {
    if (currentFrameIndex !== 0 && !frames.length) setCurrentFrameIndex(0)

    if (currentFrameIndex === 0 && frames.length) props.onChange(frames[0])

    if (!frames.length) props.onChange()
  }, [currentFrameIndex, frames.length])

  function onBackwardClick() {
    let newFrameIndex = currentFrameIndex

    if (currentFrameIndex > 0) newFrameIndex--
    else return

    setCurrentFrameIndex(newFrameIndex)

    if (props.onChange) {
      const currentFrame = frames[newFrameIndex]

      props.onChange(currentFrame)
    }
  }

  function onForwardClick() {
    let newFrameIndex = currentFrameIndex

    if (currentFrameIndex < frames.length - 1) newFrameIndex++
    else return

    setCurrentFrameIndex(newFrameIndex)

    if (props.onChange) {
      const currentFrame = frames[newFrameIndex]

      props.onChange(currentFrame)
    }
  }

  function onFastBackwardClick() {
    const newFrameIndex = 0

    setCurrentFrameIndex(newFrameIndex)

    if (props.onChange) {
      const currentFrame = frames[newFrameIndex]

      props.onChange(currentFrame)
    }
  }

  function onFastForwardClick() {
    const newFrameIndex = frames ? frames.length - 1 : 0

    setCurrentFrameIndex(newFrameIndex)

    if (props.onChange) {
      const currentFrame = frames[newFrameIndex]

      props.onChange(currentFrame)
    }
  }

  function onEvent(event, name, value) {
    if (event !== "onBlur") return

    if (frames.length) {
      value = value > frames.length ? frames.length : value
      value = value < 1 ? 1 : value
    } else value = 0

    const newFrameIndex = value > 0 ? value - 1 : 0

    setCurrentFrameIndex(newFrameIndex)

    if (props.onChange) {
      const currentFrame = frames[newFrameIndex]

      props.onChange(currentFrame)
    }
  }

  const totalFrames = frames.length
  const currentFrame = totalFrames ? currentFrameIndex + 1 : 0

  return (
    <div id="frameControl">
      <div className="row">
        <div className="col-sm-3 col-md-3 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaFastBackward className="align-middle" />,
              className: "btn btn-primary",
              type: "button",
              onClick: onFastBackwardClick,
            }}
          />
        </div>

        <div className="col-sm-3 col-md-3 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaStepBackward className="align-middle" />,
              className: "btn btn-primary",
              type: "button",
              onClick: onBackwardClick,
            }}
          />
        </div>

        <div className="col-sm-3 col-md-3 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaStepForward className="align-middle" />,
              className: "btn btn-primary",
              type: "button",
              onClick: onForwardClick,
            }}
          />
        </div>

        <div className="col-sm-3 col-md-3 text-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaFastForward className="align-middle" />,
              className: "btn btn-primary",
              type: "button",
              onClick: onFastForwardClick,
            }}
          />
        </div>
      </div>

      <br />

      <div className="row">
        <div className="col-sm-12 col-md-5 offset-md-1">
          <FormInput
            label="Frame"
            name="currentFrameIndex"
            value={currentFrame}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 6, md: 5, lg: 4 }}
            inputSizes={{ sm: 6, md: 7, lg: 8 }}
            onEvent={onEvent}
          />
        </div>

        <div className="col-sm-12 col-md-5 offset-md-1">
          <FormInput
            label="of"
            name="totalFrames"
            value={totalFrames}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 6, md: 5, lg: 4 }}
            inputSizes={{ sm: 6, md: 7, lg: 8 }}
          />
        </div>
      </div>
    </div>
  )
}

/*
_FrameControl.propTypes = {
    sceneryId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
*/
