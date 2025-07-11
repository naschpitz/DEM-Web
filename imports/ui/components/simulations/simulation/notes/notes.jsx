import React, { useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../../api/utils/getErrorMessage"
import SimulationsClass from "../../../../../api/simulations/both/class"

import Alert from "../../../../utils/alert"
import FormInput from "@naschpitz/form-input"

import "./notes.css"

export default props => {
  const [isReady, setIsReady] = useState(false)
  const [timerId, setTimerId] = useState(null)

  const simulationId = props.simulationId

  useTracker(() => {
    setIsReady(false)

    Meteor.subscribe("simulations.simulation", simulationId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [simulationId])

  const simulation = useTracker(() => {
    return SimulationsClass.findOne(simulationId)
  }, [simulationId, isReady])

  function onEvent(event, name, value) {
    // If event is "onChange", start a 2 seconds timer to save the notes
    if (event === "onChange") {
      if (timerId) clearTimeout(timerId)

      const newTimerId = setTimeout(() => updateNotes(value), 2000)
      setTimerId(newTimerId)
    }

    // If event is "onBlur", save the notes immediately
    if (event === "onBlur") {
      if (timerId) clearTimeout(timerId)
      updateNotes(value)
    }

    function updateNotes(value) {
      const simulation = {
        _id: simulationId,
        notes: value,
      }

      Meteor.callAsync("simulations.update", simulation)
        .then(() => {
          Alert.success("Notes saved.", { timeout: 2000 })
        })
        .catch(error => {
          Alert.error("Error saving notes: " + error.reason)
        })
    }
  }

  const notes = simulation?.notes

  return (
    <div className="notes">
      <FormInput
        name="notes"
        value={notes}
        type="textarea"
        rows={10}
        maxLength={30000000}
        labelSizes={{ sm: 12, md: 12, lg: 12 }}
        inputSizes={{ sm: 12, md: 12, lg: 12 }}
        onEvent={onEvent}
      />
    </div>
  )
}
