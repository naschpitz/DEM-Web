import React, { useState, useEffect } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import NonSolidObjectsClass from "../../../../../../../../api/nonSolidObjects/both/class.js"
import SolidObjectsClass from "../../../../../../../../api/solidObjects/both/class.js"

import Alert from "react-s-alert"
import FormInput from "@naschpitz/form-input"

import "./dataSelector.css"

export default DataSelector = props => {
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
    if (!(event === "onBlur" || (event === "onChange" && (name === "dataName" || name === "objectId")))) return

    const newData = {
      objectId: name === "objectId" ? value : _.get(props.data, "objectId"),
      dataName: name === "dataName" ? value : _.get(props.data, "dataName"),
    }

    if (props.onChange) props.onChange(newData)
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
        value={props.data.dataName}
        type="dropdown"
        subtype="string"
        options={options}
        size="small"
        labelSizes={{ sm: 2, md: 2, lg: 2 }}
        inputSizes={{ sm: 10, md: 10, lg: 10 }}
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
        value={props.data.objectId}
        type="dropdown"
        subtype="string"
        size="small"
        options={options}
        labelSizes={{ sm: 2, md: 2, lg: 2 }}
        inputSizes={{ sm: 10, md: 10, lg: 10 }}
        onEvent={onEvent}
      />
    )
  }

  return (
    <div id="selector">
      <div className="row">
        <div className="col-sm-12 col-md-6 col-lg-6">{renderObjectsList()}</div>

        <div className="col-sm-12 col-md-6 col-lg-6">{renderDataList()}</div>
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
