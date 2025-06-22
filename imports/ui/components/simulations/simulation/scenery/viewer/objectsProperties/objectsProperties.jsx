import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import NonSolidObjectsClass from "../../../../../../../api/nonSolidObjects/both/class.js"
import ObjectsPropertiesClass from "../../../../../../../api/objectsProperties/both/class.js"
import SolidObjectsClass from "../../../../../../../api/solidObjects/both/class.js"

import Alert from "../../../../../../utils/Alert.js"
import ClipLoader from "react-spinners/ClipLoader"
import Properties from "./properties/properties.jsx"
import ReactTable from "react-table-v6"

import "./objectsProperties.css"

export default (props) => {
  const [isNonSolidObjectsReady, setIsNonSolidObjectsReady] = useState(false)
  const [isSolidObjectsReady, setIsSolidObjectsReady] = useState(false)
  const [isObjectsPropertiesReady, setIsObjectsPropertiesReady] = useState(false)
  const [isReady, setIsReady] = useState(false)

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

  useTracker(() => {
    Meteor.subscribe("objectsProperties", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsObjectsPropertiesReady(true),
    })
  }, [props.sceneryId])

  const objectsProperties = useTracker(() => {
    const objects = _.concat(nonSolidObjects, solidObjects)
    const objectsIds = objects.map(object => object._id)

    return ObjectsPropertiesClass.find({ owner: { $in: objectsIds } }).fetch()
  })

  useEffect(() => {
    setIsReady(isNonSolidObjectsReady && isSolidObjectsReady && isObjectsPropertiesReady)
  }, [isNonSolidObjectsReady, isSolidObjectsReady, isObjectsPropertiesReady])

  function getColumns() {
    return [
      {
        Header: "Name",
        accessor: "name",
      },
    ]
  }

  function getObjectProperty(owner) {
    return _.find(objectsProperties, { owner: owner })
  }

  return (
    <div id="objectsProperties">
      {isReady ? (
        <ReactTable
          data={objects}
          columns={getColumns()}
          defaultPageSize={5}
          collapseOnDataChange={false}
          className="-striped -highlight"
          SubComponent={({ index, original }) => (
            <Properties objectProperty={getObjectProperty(original._id)} onChange={props.onChange} />
          )}
        />
      ) : (
        <div className="text-center">
          <ClipLoader size={50} color={"#DDD"} loading={true} />
        </div>
      )}
    </div>
  )
}

/*
_ObjectsProperties.propTypes = {
    sceneryId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
*/
