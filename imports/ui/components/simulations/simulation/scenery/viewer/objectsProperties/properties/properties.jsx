import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import PropTypes from "prop-types"
import _ from "lodash"

import { SketchPicker } from "react-color"
import Alert from "../../../../../../../utils/alert.js"

import "./properties.css"

export default (props) => {
  const objectProperty = props.objectProperty

  function onColorChange(color) {
    const newObjectProperty = _.cloneDeep(objectProperty)

    _.set(newObjectProperty, "color", color.rgb)

    Meteor.callAsync("objectsProperties.update", newObjectProperty)
      .then(() => {
        if (props.onChange) props.onChange()
      })
      .catch((error) => {
        Alert.error("Error saving object property: " + error.reason)
      })
  }

  return (
    <div id="properties">
      <div id="colorPicker">
        <SketchPicker
          color={{
            r: _.get(objectProperty, "color.r", 255),
            g: _.get(objectProperty, "color.g", 255),
            b: _.get(objectProperty, "color.b", 255),
            a: _.get(objectProperty, "color.a", 255),
          }}
          onChangeComplete={onColorChange}
        />
      </div>
    </div>
  )
}

/*
_Properties.propTypes = {
    objectProperty: PropTypes.object.isRequired
};
*/
