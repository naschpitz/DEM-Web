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

import Table from "../../../../../table/table"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage"
import NonSolidObjectsClass from "../../../../../../../api/nonSolidObjects/both/class"
import ObjectsPropertiesClass from "../../../../../../../api/objectsProperties/both/class"
import SolidObjectsClass from "../../../../../../../api/solidObjects/both/class"

import Alert from "../../../../../../utils/alert"
import FormInput from "@naschpitz/form-input"
import Properties from "./properties/properties"
import Spinner from "../../../../../spinner/spinner"

import "./objectsProperties.css"

export default props => {
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
  }, [nonSolidObjects, solidObjects])

  useTracker(() => {
    Meteor.subscribe("objectsProperties", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsObjectsPropertiesReady(true),
    })
  }, [props.sceneryId])

  const objectsProperties = useTracker(() => {
    const objectsIds = objects.map(object => object._id)

    return ObjectsPropertiesClass.find({ owner: { $in: objectsIds } }).fetch()
  }, [objects])

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

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "expander",
        header: () => null,
        cell: ({ row }) => (
          <button
            className="expansion-btn"
            onClick={e => {
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
      columnHelper.display({
        id: "display",
        header: "Display",
        cell: ({ row }) => {
          const objectProperty = row.original.objectProperty
          const displayValue = _.get(objectProperty, "display", true)

          return (
            <div className="d-flex">
              <FormInput
                name="display"
                value={displayValue}
                type="checkbox"
                size="small"
                onEvent={(event, name, value) => {
                  if (event === "onChange") {
                    const newObjectProperty = _.cloneDeep(objectProperty)
                    _.set(newObjectProperty, "display", value)

                    Meteor.callAsync("objectsProperties.update", newObjectProperty)
                      .then(() => {
                        if (props.onChange) props.onChange()
                      })
                      .catch(error => {
                        Alert.error("Error updating display property: " + error.reason)
                      })
                  }
                }}
              />
            </div>
          )
        },
        meta: { className: "text-center" },
        size: 80,
      }),
    ],
    [objectsProperties, props.onChange]
  )

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
    autoResetPageIndex: false,
    autoResetExpanded: false,
    initialState: {
      pagination: {
        pageSize: 5,
      },
      expanded: {},
      columnSizing: {
        expander: 20,
        name: 800,
        display: 80,
      },
    },
  })

  if (!isReady) {
    return (
      <div id="objectsProperties">
        <Spinner message="Loading objects properties..." />
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
        expansionComponent={rowData => <Properties objectProperty={rowData.objectProperty} onChange={props.onChange} />}
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
