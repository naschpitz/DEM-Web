import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import getErrorMessage from "../../../../../../api/utils/getErrorMessage.js"
import NonSolidObjectsClass from "../../../../../../api/nonSolidObjects/both/class.js"

import Alert from "../../../../../utils/Alert.js"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import FormInput from "@naschpitz/form-input"
import Properties from "./properties/properties.jsx"
import ReactTable from "react-table-v6"

import "./nonSolidObjects.css"

export default (props) => {
  const [isReady, setIsReady] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  useTracker(() => {
    Meteor.subscribe("nonSolidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const nonSolidObjects = useTracker(() => {
    return NonSolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  })

  function getColumns() {
    return [
      {
        Header: "Name",
        accessor: "name",
        Cell: cellInfo => (
          <FormInput
            name="name"
            value={getValue(cellInfo)}
            type="field"
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, cellInfo.original, name, value)}
          />
        ),
      },
      {
        Header: "Remove",
        id: "removeButton",
        className: "text-center",
        Cell: cellInfo => (
          <ButtonEnhanced
            buttonOptions={{
              regularText: "Remove",
              data: cellInfo,
              className: "btn btn-sm btn-danger ml-auto mr-auto",
              isAction: isRemoving,
              actionText: "Removing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm object removal",
              text: (
                <span>
                  Do you really want to remove the object <strong>{cellInfo.original.name}</strong> ?
                </span>
              ),
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onRemoveDone,
            }}
          />
        ),
      },
    ]
  }

  function getValue(cellInfo) {
    const name = cellInfo.column.id

    return _.get(cellInfo.original, name)
  }

  function onEvent(event, data, name, value) {
    const nonSolidObject = { _id: data._id }

    _.set(nonSolidObject, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("nonSolidObjects.update", nonSolidObject)
        .catch((error) => {
          Alert.error("Error updating non-solid object: " + getErrorMessage(error))
        })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    setIsRemoving(true)

    Meteor.callAsync("nonSolidObjects.remove", data.original._id)
      .then(() => {
        Alert.success("Non-solid object successfully removed.")
      })
      .catch((error) => {
        Alert.error("Error removing non-solid object: " + error.reason)
      })
      .finally(() => {
        setIsRemoving(false)
      })
  }

  return (
    <div id="nonSolidObjects">
      <ReactTable
        data={nonSolidObjects}
        columns={getColumns()}
        defaultPageSize={5}
        collapseOnDataChange={false}
        className="-striped -highlight"
        getTdProps={() => ({ style: { display: "flex", flexDirection: "column", justifyContent: "center" } })}
        SubComponent={({ index, original }) => <Properties object={original} />}
      />
    </div>
  )
}

/*
_NonSolidObjects.propTypes = {
    sceneryId: PropTypes.string.isRequired,
};
*/
