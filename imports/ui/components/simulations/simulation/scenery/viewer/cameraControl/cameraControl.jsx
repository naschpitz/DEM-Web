import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import CamerasClass from "../../../../../../../api/cameras/both/class.js"

import Alert from "../../../../../../utils/Alert.js"
import ClipLoader from "react-spinners/ClipLoader"
import FormInput from "@naschpitz/form-input"

import "./cameraControl.css"

export default (props) => {
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("cameras.camera", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const camera = useTracker(() => {
    return CamerasClass.findOne({ owner: props.sceneryId })
  })

  function onEvent(event, name, value) {
    const newCamera = _.cloneDeep(camera)

    _.set(newCamera, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("cameras.update", newCamera)
        .then(() => {
          if (props.onChange) props.onChange()
        })
        .catch((error) => {
          Alert.error("Error saving camera: " + error.reason)
        })
    }
  }

  return (
    <div id="cameraControl">
      {isReady ? (
        <div>
          Position
          <hr />
          <div className="row">
            <div className="col-sm-4 col-md-4">
              <FormInput
                label="X"
                name="position[0]"
                value={_.get(camera, "position[0]")}
                type="field"
                subtype="number"
                size="small"
                labelSizes={{ sm: 2, md: 3, lg: 3 }}
                inputSizes={{ sm: 5, md: 9, lg: 9 }}
                onEvent={onEvent}
              />
            </div>
            <div className="col-sm-4 col-md-4">
              <FormInput
                label="Y"
                name="position[1]"
                value={_.get(camera, "position[1]")}
                type="field"
                subtype="number"
                size="small"
                labelSizes={{ sm: 2, md: 3, lg: 3 }}
                inputSizes={{ sm: 5, md: 9, lg: 9 }}
                onEvent={onEvent}
              />
            </div>
            <div className="col-sm-4 col-md-4">
              <FormInput
                label="Z"
                name="position[2]"
                value={_.get(camera, "position[2]")}
                type="field"
                subtype="number"
                size="small"
                labelSizes={{ sm: 2, md: 3, lg: 3 }}
                inputSizes={{ sm: 5, md: 9, lg: 9 }}
                onEvent={onEvent}
              />
            </div>
          </div>
          Look At
          <hr />
          <div className="row">
            <div className="col-sm-4 col-md-4">
              <FormInput
                label="X"
                name="lookAt[0]"
                value={_.get(camera, "lookAt[0]")}
                type="field"
                subtype="number"
                size="small"
                labelSizes={{ sm: 2, md: 3, lg: 3 }}
                inputSizes={{ sm: 5, md: 9, lg: 9 }}
                onEvent={onEvent}
              />
            </div>
            <div className="col-sm-4 col-md-4">
              <FormInput
                label="Y"
                name="lookAt[1]"
                value={_.get(camera, "lookAt[1]")}
                type="field"
                subtype="number"
                size="small"
                labelSizes={{ sm: 2, md: 3, lg: 3 }}
                inputSizes={{ sm: 5, md: 9, lg: 9 }}
                onEvent={onEvent}
              />
            </div>
            <div className="col-sm-4 col-md-4">
              <FormInput
                label="Z"
                name="lookAt[2]"
                value={_.get(camera, "lookAt[2]")}
                type="field"
                subtype="number"
                size="small"
                labelSizes={{ sm: 2, md: 3, lg: 3 }}
                inputSizes={{ sm: 5, md: 9, lg: 9 }}
                onEvent={onEvent}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <ClipLoader size={50} color={"#DDD"} loading={true} />
        </div>
      )}
    </div>
  )
}
