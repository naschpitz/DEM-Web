import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import MaterialsClass from "../../../../../../../api/materials/both/class.js"

import Alert from "../../../../../../utils/alert.js"
import FormInput from "@naschpitz/form-input"

import {
  getForcesOptions,
  getForcesCoefficientsOptions,
  getDragForcesOptions,
  getDragForcesCoefficientsOptions,
} from "../../../../../../common/materials"

import "./properties.css"

export default (props) => {
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("materials.list", props.material.owner, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.material])

  const materials = useTracker(() => {
    return MaterialsClass.find({ owner: props.material.owner }).fetch()
  })

  const material = props.material

  function onEvent(event, name, value) {
    const material = _.cloneDeep(props.material)

    _.set(material, name, value)

    Meteor.callAsync("materials.update", material)
      .catch((error) => {
        Alert.error("Error saving material: " + error.reason)
      })
  }

  function getCoefficientsInputs(type, material) {
    const coefficientsOptions = getCoefficientsOptions(type)

    function getCoefficientsOptions(type) {
      switch (type) {
        case "force": {
          return getForcesCoefficientsOptions(material.forceType)
        }
        case "dragForce": {
          return getDragForcesCoefficientsOptions(material.dragForceType)
        }
      }
    }

    const coefficients = coefficientsOptions.map(forceCoefficientOption => {
      return {
        label: forceCoefficientOption.text,
        name: forceCoefficientOption.value,
        value: _.get(material, forceCoefficientOption.value),
      }
    })

    return (
      <div>
        {coefficients.map(coefficient => (
          <FormInput
            key={coefficient.label}
            label={coefficient.label}
            name={coefficient.name}
            value={coefficient.value}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 6, md: 4, lg: 4 }}
            inputSizes={{ sm: 6, md: 6, lg: 6 }}
            onEvent={onEvent}
          />
        ))}
      </div>
    )
  }

  let materialsOptions = materials.map(materialItem => {
    if (materialItem._id === material._id) return null

    return { value: materialItem._id, text: materialItem.name }
  })

  materialsOptions = _.compact(materialsOptions)
  materialsOptions.unshift({ value: "", text: "-- Select Material --" })

  const forcesOptions = getForcesOptions()
  forcesOptions.unshift({ value: "", text: "-- Select Force --" })

  const dragForcesOptions = getDragForcesOptions()
  dragForcesOptions.unshift({ value: "", text: "-- Select Drag Force --" })

  return (
    <div id="materialProperties">
      <div className="row">
        <div className="col-md-4">
          <FormInput
            label="Material 1"
            name="material1"
            value={material.material1}
            type="dropdown"
            subtype="string"
            options={materialsOptions}
            size="small"
            labelSizes={{ sm: 6, md: 4, lg: 4 }}
            inputSizes={{ sm: 6, md: 6, lg: 6 }}
            onEvent={onEvent}
          />
        </div>

        <div className="col-md-4">
          <FormInput
            label="Material 2"
            name="material2"
            value={material.material2}
            type="dropdown"
            subtype="string"
            options={materialsOptions}
            size="small"
            labelSizes={{ sm: 6, md: 4, lg: 4 }}
            inputSizes={{ sm: 6, md: 6, lg: 6 }}
            onEvent={onEvent}
          />
        </div>

        <div className="col-md-4">
          <FormInput
            label="Distance Threshold"
            name="distanceThreshold"
            value={material.distanceThreshold}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 6, md: 4, lg: 4 }}
            inputSizes={{ sm: 6, md: 6, lg: 6 }}
            onEvent={onEvent}
          />
        </div>
      </div>

      <hr />

      <div className="row">
        <div className="col-md-4">
          <FormInput
            label="Force"
            name="forceType"
            value={material.forceType}
            type="dropdown"
            subtype="string"
            options={forcesOptions}
            size="small"
            labelSizes={{ sm: 6, md: 4, lg: 4 }}
            inputSizes={{ sm: 6, md: 6, lg: 6 }}
            onEvent={onEvent}
          />

          {getCoefficientsInputs("force", material)}
        </div>

        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Drag"
            name="dragForceType"
            value={material.dragForceType}
            type="dropdown"
            subtype="string"
            options={dragForcesOptions}
            size="small"
            labelSizes={{ sm: 6, md: 4, lg: 4 }}
            inputSizes={{ sm: 6, md: 6, lg: 6 }}
            onEvent={onEvent}
          />

          {getCoefficientsInputs("dragForce", material)}
        </div>
      </div>
    </div>
  )
}

/*
_Properties.propTypes = {
    material: PropTypes.object.isRequired
};
*/
