import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"

import Alert from "../../../../../../utils/Alert.js"
import FormInput from "@naschpitz/form-input"

export default (props) => {
  const [materialsObjects, setMaterialsObjects] = useState([])

  useTracker(() => {
    if (!props.type || !props.calibrationId) return

    switch (props.type) {
      case "material": {
        Meteor.callAsync("materials.getByCalibration", props.calibrationId)
          .then((result) => {
            setMaterialsObjects(result)
          })
          .catch((error) => {
            Alert.error("Error: " + getErrorMessage(error))
          })

        break
      }

      case "nonSolidObject": {
        Meteor.callAsync("nonSolidObjects.getByCalibration", props.calibrationId)
          .then((result) => {
            setMaterialsObjects(result)
          })
          .catch((error) => {
            Alert.error("Error: " + getErrorMessage(error))
          })

        break
      }

      case "solidObject": {
        Meteor.callAsync("solidObjects.getByCalibration", props.calibrationId)
          .then((result) => {
            setMaterialsObjects(result)
          })
          .catch((error) => {
            Alert.error("Error: " + getErrorMessage(error))
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
