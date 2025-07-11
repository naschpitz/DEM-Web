import React, { useState, useMemo } from "react"
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

import Table from "../../../../table/table"

import getErrorMessage from "../../../../../../api/utils/getErrorMessage"
import SolidObjectsClass from "../../../../../../api/solidObjects/both/class"

import Alert from "../../../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import Spinner from "../../../../spinner/spinner"
import FormInput from "@naschpitz/form-input"
import Properties from "./properties/properties"
import useIsState from "../../../../../hooks/useIsState"

import "./solidObjects.css"

export default props => {
  const [isReady, setIsReady] = useState(false)
  const isRemoving = useIsState()

  useTracker(() => {
    Meteor.subscribe("solidObjects.list", props.sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [props.sceneryId])

  const solidObjects = useTracker(() => {
    return SolidObjectsClass.find({ owner: props.sceneryId }).fetch()
  }, [props.sceneryId])

  // Create reactive data for the table
  const data = useMemo(() => {
    return solidObjects.map(solidObject => ({
      ...solidObject,
    }))
  }, [solidObjects])

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
        cell: info => (
          <FormInput
            name="name"
            value={info.getValue()}
            type="field"
            subtype="string"
            autoComplete={false}
            size="small"
            inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
            onEvent={(event, name, value) => onEvent(event, info.row.original, name, value)}
          />
        ),
        meta: { className: "text-center" },
      }),
      columnHelper.display({
        id: "remove",
        header: "Remove",
        cell: info => (
          <ButtonEnhanced
            buttonOptions={{
              regularText: "Remove",
              data: info.row.original,
              className: "btn btn-sm btn-danger ml-auto mr-auto",
              isAction: isRemoving.getState(info.row.original._id),
              actionText: "Removing...",
              type: "button",
            }}
            confirmationOptions={{
              title: "Confirm object removal",
              text: (
                <span>
                  Do you really want to remove the object <strong>{info.row.original.name}</strong> ?
                </span>
              ),
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onRemoveDone,
            }}
          />
        ),
        meta: {
          className: "text-center",
        },
      }),
    ],
    [isRemoving.isState]
  )

  function onEvent(event, data, name, value) {
    const solidObject = { _id: data._id }

    _.set(solidObject, name, value)

    if (event === "onBlur") {
      Meteor.callAsync("solidObjects.update", solidObject).catch(error => {
        Alert.error("Error updating solid object: " + getErrorMessage(error))
      })
    }
  }

  function onRemoveDone(result, data) {
    if (!result) return

    const solidObjectId = data._id
    isRemoving.setState(solidObjectId, true)

    Meteor.callAsync("solidObjects.remove", data._id)
      .then(() => {
        Alert.success("Solid object successfully removed.")
      })
      .catch(error => {
        Alert.error("Error removing solid object: " + error.reason)
      })
      .finally(() => {
        isRemoving.setState(solidObjectId, false)
      })
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
        name: 1000,
        remove: 200,
      },
    },
  })

  if (!isReady) {
    return (
      <div id="solidObjects">
        <Spinner message="Loading solid objects..." />
      </div>
    )
  }

  if (solidObjects.length === 0) {
    return (
      <div id="solidObjects">
        <div className="text-center p-4">
          <div className="text-muted">No solid objects found.</div>
        </div>
      </div>
    )
  }

  return (
    <div id="solidObjects">
      <Table table={table} expansionComponent={rowData => <Properties object={rowData} />} tableId="solidObjects" />
    </div>
  )
}

/*
_SolidObjects.propTypes = {
    sceneryId: PropTypes.string.isRequired,
};
*/
