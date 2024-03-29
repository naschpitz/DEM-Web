import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import Alert from "react-s-alert-v3"
import FormInput from "@naschpitz/form-input"

export default MaterialObjectSelect = props => {
  const [materialsObjects, setMaterialsObjects] = useState([])

  useTracker(() => {
    if (!props.type || !props.calibrationId) return

    switch (props.type) {
      case "material": {
        Meteor.call("materials.getByCalibration", props.calibrationId, (error, result) => {
          if (error) {
            Alert.error("Error: " + getErrorMessage(error))
          } else {
            setMaterialsObjects(result)
          }
        })

        break
      }

      case "nonSolidObject": {
        Meteor.call("nonSolidObjects.getByCalibration", props.calibrationId, (error, result) => {
          if (error) {
            Alert.error("Error: " + getErrorMessage(error))
          } else {
            setMaterialsObjects(result)
          }
        })

        break
      }

      case "solidObject": {
        Meteor.call("solidObjects.getByCalibration", props.calibrationId, (error, result) => {
          if (error) {
            Alert.error("Error: " + getErrorMessage(error))
          } else {
            setMaterialsObjects(result)
          }
        })

        break
      }
    }
  }, [props.calibrationId, props.type])

  function getList(materialsObjects) {
    const list = materialsObjects.map(materialObject => {
      return {
        value: materialObject._id,
        text: materialObject.name,
      }
    })

    list.unshift({ value: "", text: "-- Select a Material or Object --" })

    return list
  }

  const options = getList(materialsObjects)

  const newProps = {
    ...props.formInputProps,
    options: options,
  }

  return <FormInput {...newProps} />
}
