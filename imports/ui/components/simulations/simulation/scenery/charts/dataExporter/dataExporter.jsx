import React from "react"
import { Meteor } from "meteor/meteor"
import PropTypes from "prop-types"
import fileDownload from "js-file-download"

import { FaFileExport } from "react-icons/fa"
import Alert from "../../../../../../utils/alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import "./dataExporter.css"

export default ({ sceneryId, objectId, dataName, minInterval, maxInterval }) => {
  function onClick() {
    Meteor.callAsync("frames.getData", sceneryId, objectId, dataName, minInterval, maxInterval, (error, result) => {
      if (error) Alert.error("Error getting frame data: " + error.reason)
      else fileDownload(result, "data.txt")
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
