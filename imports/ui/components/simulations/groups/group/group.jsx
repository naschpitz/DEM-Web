import React, { useEffect, useState } from "react";
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import SimulationsClass from "../../../../../api/simulations/both/class"

import Alert from "react-s-alert-v3"

import { ButtonEnhanced } from "@naschpitz/button-enhanced"
import { FaTrashAlt, FaEdit, FaCheck, FaTimes } from "react-icons/fa"
import FormInput from "@naschpitz/form-input";

import SimulationsTable from "../../simulationsTable/simulationsTable.jsx"

import "./group.css"

export default Group = props => {
  const [isRemovingGroup, setIsRemovingGroup] = useState(false)
  const [isSimulationsReady, setIsSimulationsReady] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState("")

  const group = props.group

  useTracker(() => {
    Meteor.subscribe("simulations.byGroup", group._id, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsSimulationsReady(true),
    })
  }, [])

  const simulationsIds = useTracker(() => {
    return SimulationsClass
      .find({ primary: true, group: group._id }, { sort: { createdAt: -1 } })
      .map(simulation => simulation._id)
  }, [group])

  useEffect(() => {
    setName(group.name)
  }, [group]);

  function onRemoveGroupDone(result, data) {
    if (!result) return

    setIsRemovingGroup(true)

    Meteor.call("groups.remove", data, error => {
      if (error) Alert.error("Error removing group: " + error.reason)
      else Alert.success("Group successfully removed.")

      setIsRemovingGroup(false)
    })
  }

  function onEditClick() {
    setName(group.name)
    setIsEditing(true)
  }

  function onEvent(event, name, value) {
    if (event === "onChange") {
      setName(value)
    }
  }

  function onSaveClick() {
    setIsEditing(false)

    group.name = name

    Meteor.call("groups.update", group, error => {
      if (error) Alert.error("Error updating group: " + error.reason)
      else Alert.success("Group name successfully updated.")
    })
  }

  function onCancelClick() {
    setIsEditing(false)
    setName(group.name)
  }

  return (
    <div id="group" className="card">
      <div className="card-header d-flex">
        <div className="d-flex align-items-center">
          { isEditing ?
            <>
              <FormInput
                name="name"
                value={name}
                type="field"
                subtype="string"
                autoComplete={false}
                size="small"
                inputSizes={{ sm: 12, md: 12, lg: 12, xl: 12 }}
                onEvent={(event, name, value) => onEvent(event, name, value)}
              />
              <div className="d-flex align-items-center ml-4">
                <ButtonEnhanced
                  buttonOptions={{
                    regularText: <FaCheck className="align-middle" />,
                    className: "btn btn-sm btn-success mr-2",
                    type: "button",
                    onClick: () => onSaveClick()
                  }}
                />
                <ButtonEnhanced
                  buttonOptions={{
                    regularText: <FaTimes className="align-middle" />,
                    className: "btn btn-sm btn-danger",
                    type: "button",
                    onClick: () => onCancelClick()
                  }}
                />
              </div>
            </> :
            <>
              {group.name} &nbsp;
              <ButtonEnhanced
                buttonOptions={{
                  regularText: <FaEdit className="align-middle" />,
                  className: "btn btn-sm btn-primary",
                  type: "button",
                  onClick: onEditClick
                }}
              />
            </>
          }
        </div>

        <div className="ml-auto align-self-center">
          <ButtonEnhanced
            buttonOptions={{
              regularText: <FaTrashAlt className="align-middle" />,
              className: "btn btn-sm btn-danger",
              data: group._id,
              isAction: isRemovingGroup,
              actionText: <div className="loaderSpinner loader-small" />,
              type: "button"
            }}
            confirmationOptions={{
              title: "Confirm data set removal",
              text: <span>Do you really want to remove this group?</span>,
              confirmButtonText: "Remove",
              confirmButtonAction: "Removing...",
              cancelButtonText: "Cancel",
              onDone: onRemoveGroupDone
            }}
          />
        </div>
      </div>

      <div className="card-body">
        <SimulationsTable simulationsIds={simulationsIds} />
      </div>
    </div>
  )
}