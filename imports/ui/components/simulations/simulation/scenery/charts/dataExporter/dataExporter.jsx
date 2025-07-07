import React from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import fileDownload from "js-file-download"

import NonSolidObjectsClass from "../../../../../../../api/nonSolidObjects/both/class"
import SceneriesClass from "../../../../../../../api/sceneries/both/class"
import SimulationsClass from "../../../../../../../api/simulations/both/class"
import SolidObjectsClass from "../../../../../../../api/solidObjects/both/class"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage"

import { FaFileExport } from "react-icons/fa"
import Alert from "../../../../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import "./dataExporter.css"

export default ({ sceneryId, objectId, dataName, minInterval, maxInterval }) => {
  // Get scenery data (should already be subscribed by parent component)
  const scenery = useTracker(() => {
    return SceneriesClass.findOne(sceneryId)
  }, [sceneryId])

  // Get simulation data (should already be subscribed by parent component)
  const simulation = useTracker(() => {
    if (!scenery) return null
    return SimulationsClass.findOne(scenery.owner)
  }, [scenery])

  // Get object data (should already be subscribed by DataSelector component)
  const object = useTracker(() => {
    if (!objectId) return null

    // Try to find in non-solid objects first
    let obj = NonSolidObjectsClass.findOne(objectId)
    if (obj) return obj

    // If not found, try solid objects
    obj = SolidObjectsClass.findOne(objectId)
    return obj
  }, [objectId])

  function onClick() {
    // Create a descriptive filename
    const simulationName = simulation.name
    const objectName = object.name

    const cleanSimulationName = simulationName.replace(/[^a-zA-Z0-9_-]/g, "_")
    const cleanObjectName = objectName.replace(/[^a-zA-Z0-9_-]/g, "_")
    const cleanDataName = dataName.replace(/[^a-zA-Z0-9_-]/g, "_")

    const filename = `${cleanSimulationName}_${cleanObjectName}_${cleanDataName}.txt`

    Meteor.callAsync("frames.getData", sceneryId, objectId, dataName, minInterval, maxInterval)
      .then(result => {
        fileDownload(result, filename)
      })
      .catch(error => {
        Alert.error(getErrorMessage(error))
      })
  }

  const disabled = !sceneryId || !objectId || !dataName

  return (
    <div id="dataExporter">
      <ButtonEnhanced
        buttonOptions={{
          regularText: (
            <span>
              {" "}
              <FaFileExport className="align-middle" /> Export{" "}
            </span>
          ),
          className: "btn btn-sm btn-success",
          disabled: disabled,
          onClick: onClick,
          type: "button",
        }}
      />
    </div>
  )
}

/*
_DataExporter.propTypes = {
    sceneryId: PropTypes.string,
    objectId: PropTypes.string,
    dataName: PropTypes.string,
    minInterval: PropTypes.number,
    maxInterval: PropTypes.number,
};
*/
