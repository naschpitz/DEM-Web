import React, { useState, useEffect } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import getErrorMessage from "../../../../../../../../api/utils/getErrorMessage.js"
import NonSolidObjectsClass from "../../../../../../../../api/nonSolidObjects/both/class.js"
import SolidObjectsClass from "../../../../../../../../api/solidObjects/both/class.js"

import Alert from "../../../../../../../utils/alert.js"
import FormInput from "@naschpitz/form-input"

import "./dataSelector.css"

export default (props) => {
  const [isNonSolidObjectsReady, setIsNonSolidObjectsReady] = useState(false)
  const [isSolidObjectsReady, setIsSolidObjectsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("nonSolidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsNonSolidObjectsReady(true),
    })

    Meteor.subscribe("solidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSolidObjectsReady(true),
    })
  }, [props.sceneryId])

  const nonSolidObjects = useTracker(() => {
    return NonSolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  })

  const solidObjects = useTracker(() => {
    return SolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  })

  const objects = _.concat(nonSolidObjects, solidObjects)

  function onEvent(event, name, value) {
    if (!(event === "onBlur" || (event === "onChange" && (name === "dataName" || name === "objectId" || name === "startCondition" || name === "enabled")))) return

    const newData = { [name]: value }

    if (props.onData) props.onData(newData)
  }

  function renderDataList() {
    const options = [
      { value: "", text: "-- Select a Data --" },
      { value: "position[0]", text: "Position X" },
      { value: "position[1]", text: "Position Y" },
      { value: "position[2]", text: "Position Z" },
      { value: "velocity[0]", text: "Velocity X" },
      { value: "velocity[1]", text: "Velocity Y" },
      { value: "velocity[2]", text: "Velocity Z" },
      { value: "force[0]", text: "Force X" },
      { value: "force[1]", text: "Force Y" },
      { value: "force[2]", text: "Force Z" },
      { value: "kineticEnergyTotal", text: "Total Kinetic Energy" },
      { value: "kineticEnergyExternal", text: "Kinetic Energy External" },
      { value: "kineticEnergyInternal", text: "Kinetic Energy Internal" },
    ]

    return (
      <FormInput
        label="Data"
        name="dataName"
        value={props.dataName}
        type="dropdown"
        subtype="string"
        options={options}
        size="small"
        labelSizes={{ sm: 6, md: 4, lg: 3 }}
        inputSizes={{ sm: 6, md: 8, lg: 9 }}
        onEvent={onEvent}
      />
    )
  }

  function renderObjectsList() {
    const options = objects.map(object => {
      return { value: object._id, text: object.name }
    })

    options.unshift({ value: "", text: "-- Select an Object --" })

    return (
      <FormInput
        label="Object"
        name="objectId"
        value={props.objectId}
        type="dropdown"
        subtype="string"
        size="small"
        options={options}
        labelSizes={{ sm: 6, md: 4, lg: 3 }}
        inputSizes={{ sm: 6, md: 8, lg: 9 }}
        onEvent={onEvent}
      />
    )
  }

  function renderStartConditionOptions() {
    const options = [
      { value: "", text: "-- Select a Start Condition --" },
      { value: "lt", text: "Less Than" },
      { value: "lte", text: "Less Than or Equal" },
      { value: "eq", text: "Equal" },
      { value: "gt", text: "Greater Than" },
      { value: "gte", text: "Greater Than or Equal" },
    ]

    return (
      <FormInput
        label="Start Cond."
        name="startCondition"
        value={props.startCondition}
        type="dropdown"
        subtype="string"
        size="small"
        options={options}
        labelSizes={{ sm: 2, md: 2, lg: 4 }}
        inputSizes={{ sm: 10, md: 10, lg: 8 }}
        onEvent={onEvent}
      />
    )
  }

  return (
    <div id="dataSelector">
      <div className="row vertical-center" id="objectDataSelectors">
        <div className="col-sm-12 col-md-6 col-lg-3">
          <FormInput
            label="Name"
            name="name"
            value={props.name}
            type="field"
            subtype="string"
            size="small"
            labelSizes={{ sm: 2, md: 2, lg: 4 }}
            inputSizes={{ sm: 10, md: 10, lg: 8 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-6 col-lg-3">{renderObjectsList()}</div>
        <div className="col-sm-12 col-md-6 col-lg-3">{renderDataList()}</div>
      </div>
      <div className="row vertical-center" id="conditionsSelector">
        <div className="col-sm-12 col-md-6 col-lg-3">{renderStartConditionOptions()}</div>
        <div className="col-sm-12 col-md-6 col-lg-3">
          <FormInput
            label="Start Thres."
            name="startThreshold"
            value={props.startThreshold}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 2, md: 2, lg: 4 }}
            inputSizes={{ sm: 10, md: 10, lg: 8 }}
            onEvent={onEvent}
          />
        </div>
        <div className={"col-sm-12 col-md-6 col-lg-3"}>
          <FormInput
            label="Weight"
            name="weight"
            value={props.weight}
            type="field"
            subtype="number"
            size="small"
            labelSizes={{ sm: 2, md: 2, lg: 4 }}
            inputSizes={{ sm: 10, md: 10, lg: 8 }}
            onEvent={onEvent}
          />
        </div>
        <div className="col-sm-12 col-md-6 col-lg-2">
          <FormInput
            label="Enabled"
            name="enabled"
            value={props.enabled}
            type="checkbox"
            size="small"
            labelSizes={{ sm: 8, md: 8, lg: 8 }}
            inputSizes={{ sm: 4, md: 4, lg: 4 }}
            onEvent={onEvent}
          />
        </div>
      </div>
    </div>
  )
}

/*
_DataSelector.propTypes = {
    sceneryId: PropTypes.string.isRequired,
    onChange: PropTypes.func
};
*/
