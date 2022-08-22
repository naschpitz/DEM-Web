import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import MaterialsClass from "../../../../../../../api/materials/both/class.js"

import Alert from "react-s-alert"
import FormInput from "@naschpitz/form-input"

import "./properties.css"

export default Properties = props => {
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("materials.list", props.object.owner, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.material])

  const materials = useTracker(() => {
    return MaterialsClass.find({ owner: props.object.owner }).fetch()
  })

  function onEvent(event, name, value) {
    const object = _.cloneDeep(props.object)

    _.set(object, name, value)

    if (event === "onBlur" || (event === "onChange" && (name === "fixed" || name === "material"))) {
      Meteor.call("nonSolidObjects.update", object, error => {
        if (error) Alert.error("Error saving non-solid object: " + error.reason)
      })
    }
  }

  const materialsOptions = materials.map(material => {
    return { value: material._id, text: material.name }
  })

  materialsOptions.unshift({ value: "", text: "-- Select Material --" })

  const object = props.object

  return (
    <div id="nonSolidObjectProperties">
      <div className="row">
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Length X"
            name="dimensions.length[0]"
            value={_.get(object, "dimensions.length[0]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Length Y"
            name="dimensions.length[1]"
            value={_.get(object, "dimensions.length[1]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Length Z"
            name="dimensions.length[2]"
            value={_.get(object, "dimensions.length[2]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Spacing"
            name="dimensions.spacing"
            value={_.get(object, "dimensions.spacing")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Density"
            name="density"
            value={object.density}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Fixed"
            name="fixed"
            value={object.fixed}
            type="checkbox"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Position X"
            name="position[0]"
            value={_.get(object, "position[0]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>

        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Position Y"
            name="position[1]"
            value={_.get(object, "position[1]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Position Z"
            name="position[2]"
            value={_.get(object, "position[2]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Velocity X"
            name="velocity[0]"
            value={_.get(object, "velocity[0]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Velocity Y"
            name="velocity[1]"
            value={_.get(object, "velocity[1]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-4">
          <FormInput
            label="Velocity Z"
            name="velocity[2]"
            value={_.get(object, "velocity[2]")}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 12, md: 5, lg: 5 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
      </div>

      <div className="row">
        <div className="col-sm-12 col-md-8 col-lg-8">
          <FormInput
            label="Material"
            name="material"
            value={object.material}
            type="dropdown"
            subtype="string"
            size="small"
            options={materialsOptions}
            labelSizes={{ sm: 12, md: 3, lg: 3 }}
            inputSizes={{ sm: 12, md: 7, lg: 7 }}
            onEvent={onEvent}
          />
        </div>
      </div>
    </div>
  )
}

/*
_Properties.propTypes = {
    object: PropTypes.object.isRequired
};
*/
