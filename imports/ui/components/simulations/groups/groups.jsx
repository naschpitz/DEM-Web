import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../api/utils/getErrorMessage"
import GroupsClass from "../../../../api/groups/both/class"

import { FaPlus } from "react-icons/fa"
import Alert from "../../../utils/alert"
import { ButtonEnhanced } from "@naschpitz/button-enhanced"

import Group from "./group/group"

import "./groups.css"

export default () => {
  const [isGroupsReady, setIsGroupsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("groups.list", {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsGroupsReady(true),
    })
  }, [])

  const groups = useTracker(() => {
    return GroupsClass.find({}, { sort: { createdAt: -1 } }).fetch()
  })

  function onCreateDone(result, data) {
    if (!result) return

    Meteor.callAsync("groups.create")
      .then(() => {
        Alert.success("Group successfully created.")
      })
      .catch(error => {
        Alert.error("Error creating group: " + error.reason)
      })
  }

  return (
    <div id="groups">
      <h2 className="text-center">
        Groups &nbsp;
        <ButtonEnhanced
          buttonOptions={{
            regularText: <FaPlus className="align-middle" />,
            className: "btn btn-sm btn-success ml-auto mr-auto",
            isAction: false,
            actionText: "Creating...",
            type: "button",
          }}
          confirmationOptions={{
            title: "Confirm group creation",
            text: <span>Do you really want to create a new group?</span>,
            confirmButtonText: "Create",
            confirmButtonAction: "Creating...",
            cancelButtonText: "Cancel",
            onDone: onCreateDone,
          }}
        />
      </h2>
      {groups.map(group => (
        <Group key={group._id} group={group} />
      ))}
    </div>
  )
}
