import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import NonSolidObjectsClass from "../../../../../../../../../api/nonSolidObjects/both/class.js"
import SolidObjectsClass from "../../../../../../../../../api/solidObjects/both/class.js"

import Alert from "react-s-alert-v3"
import FormInput from "@naschpitz/form-input"

import "./dataDisplay.css"

export default DataDisplay = props => {
  const [isNonSolidObjectsReady, setIsNonSolidObjectsReady] = useState(false)
  const [isSolidObjectsReady, setIsSolidObjectsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("nonSolidObjects.nonSolidObject", props.objectId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsNonSolidObjectsReady(true),
    })

    Meteor.subscribe("solidObjects.solidObject", props.objectId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSolidObjectsReady(true),
    })
  }, [props.objectId])

  const nonSolidObject = useTracker(() => {
    return NonSolidObjectsClass.findOne(props.objectId)
  })

  const solidObject = useTracker(() => {
    return SolidObjectsClass.findOne(props.objectId)
  })

  const object = nonSolidObject || solidObject

  function renderDataName() {
    const dataNameMap = {
      undefined: "Loading...",
      "position[0]": "Position X",
      "position[1]": "Position Y",
      "position[2]": "Position Z",
      "velocity[0]": "Velocity X",
      "velocity[1]": "Velocity Y",
      "velocity[2]": "Velocity Z",
      "force[0]": "Force X",
      "force[1]": "Force Y",
      "force[2]": "Force Z",
      "kineticEnergyTotal": "Total Kinetic Energy",
      "kineticEnergyExternal": "Kinetic Energy External",
      "kineticEnergyInternal": "Kinetic Energy Internal"
    }

    return (
      <FormInput
        label="Data"
        name="dataName"
        value={dataNameMap[props.dataName]}
        type="field"
        subtype="string"
        size="small"
        disabled={true}
        labelSizes={{ sm: 6, md: 4, lg: 3 }}
        inputSizes={{ sm: 6, md: 8, lg: 9 }}
      />
    )
  }

  function renderObjectName() {
    return (
      <FormInput
        label="Object"
        name="objectName"
        value={object?.name}
        type="field"
        subtype="string"
        size="small"
        disabled={true}
        labelSizes={{ sm: 6, md: 4, lg: 3 }}
        inputSizes={{ sm: 6, md: 8, lg: 9 }}
      />
    )
  }

  function renderScore() {
    return (
      <FormInput
        label="Score"
        name="score"
        value={props.score}
        type="field"
        subtype="number"
        size="small"
        disabled={true}
        labelSizes={{ sm: 6, md: 4, lg: 3 }}
        inputSizes={{ sm: 6, md: 8, lg: 9 }}
      />
    )
  }

  return (
    <div id="dataDisplay" className="row vertical-center">
      <div className="col-sm-12 col-md-4 col-lg-3">
        <FormInput
          label="Name"
          name="name"
          value={props.name}
          type="field"
          subtype="string"
          size="small"
          disabled={true}
          labelSizes={{ sm: 6, md: 4, lg: 3 }}
          inputSizes={{ sm: 6, md: 8, lg: 9 }}
        />
      </div>
      <div className="col-sm-12 col-md-4 col-lg-3">{renderObjectName()}</div>
      <div className="col-sm-12 col-md-4 col-lg-3">{renderDataName()}</div>
      <div className="col-sm-12 col-md-4 col-lg-3">{renderScore()}</div>
    </div>
  )
}
