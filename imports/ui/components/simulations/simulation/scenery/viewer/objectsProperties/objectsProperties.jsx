import React, { useEffect, useState, useMemo } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import { FaChevronRight, FaChevronDown } from "react-icons/all"
import PropTypes from "prop-types"
import _ from "lodash"

import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getExpandedRowModel,
  createColumnHelper,
} from "@tanstack/react-table"

import Table from "../../../../../table/table.jsx"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import NonSolidObjectsClass from "../../../../../../../api/nonSolidObjects/both/class.js"
import ObjectsPropertiesClass from "../../../../../../../api/objectsProperties/both/class.js"
import SolidObjectsClass from "../../../../../../../api/solidObjects/both/class.js"

import Alert from "../../../../../../utils/alert.js"
import ClipLoader from "react-spinners/ClipLoader"
import Properties from "./properties/properties.jsx"

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
  }, [props.sceneryId])

  const solidObjects = useTracker(() => {
    return SolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  }, [props.sceneryId])

  const objects = useMemo(() => {
    return _.concat(nonSolidObjects, solidObjects)
    }, [nonSolidObjects, solidObjects]
  )

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
  }, [nonSolidObjects, solidObjects])

  // Create reactive data for the table
  const data = useMemo(() => {
    return objects.map(object => ({
      ...object,
      objectProperty: getObjectProperty(object._id),
    }))
  }, [objects, objectsProperties])

  useEffect(() => {
    setIsReady(isNonSolidObjectsReady && isSolidObjectsReady && isObjectsPropertiesReady)
  }, [isNonSolidObjectsReady, isSolidObjectsReady, isObjectsPropertiesReady])

  const columnHelper = createColumnHelper()

  const columns = useMemo(() => [
    columnHelper.display({
      id: "expander",
      header: () => null,
      cell: ({ row }) => (
        <button
          className="expansion-btn"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            row.toggleExpanded()
          }}
          type="button"
        >
          {row.getIsExpanded() ? <FaChevronDown /> : <FaChevronRight />}
        </button>
      ),
      size: 30,
    }),
    columnHelper.accessor("name", {
      header: "Name",
      meta: { className: "text-center" },
    }),
  ], [])

  function getObjectProperty(owner) {
    return _.find(objectsProperties, { owner: owner })
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    enableExpanding: true,
    enableColumnResizing: true, // Enable resizing
    columnResizeMode: "onChange", // "onEnd" also supported
    initialState: {
      pagination: {
        pageSize: 5,
      },
      expanded: {},
      columnSizing: {}, // optional: initial sizes
    },
  })

  if (!isReady) {
    return (
      <div id="objectsProperties">
        <div className="text-center p-4">
          <ClipLoader size={50} color={"#DDD"} loading={true} />
          <div className="mt-2">Loading objects properties...</div>
        </div>
      </div>
    )
  }

  if (objects.length === 0) {
    return (
      <div id="objectsProperties">
        <div className="text-center p-4">
          <div className="text-muted">No objects found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="objectsProperties">
      <Table
        table={table}
        expansionComponent={(rowData) => <Properties objectProperty={rowData.objectProperty} onChange={props.onChange} />}
        tableId="objectsProperties"
      />
    </div>
  )
}

/*
_ObjectsProperties.propTypes = {
    sceneryId: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
};
*/
