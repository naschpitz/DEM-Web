import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"

import getErrorMessage from "../../../../../../../api/utils/getErrorMessage.js"
import { getDragForcesCoefficientsOptions, getForcesCoefficientsOptions } from "../../../../../../common/materials"

import Alert from "../../../../../../utils/Alert.js"
import FormInput from "@naschpitz/form-input"

export default (props) => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!props.type || !props.materialObjectId) return

    switch (props.type) {
      case "material": {
        Meteor.callAsync("materials.getById", props.materialObjectId)
          .then((result) => {
            const coefficients = getForcesCoefficientsOptions(result.forceType)
            const dragCoefficients = getDragForcesCoefficientsOptions(result.dragForceType)

            setOptions([
              { value: "", text: "-- Select a Coefficient --" },
              { value: "", text: "-- Forces Coefficients --" },
              ...coefficients,
              { value: "", text: "-- Drag Forces Coefficients --" },
              ...dragCoefficients,
            ])
          })
          .catch((error) => {
            Alert.error("Error: " + getErrorMessage(error))
          })

        break
      }

      case "nonSolidObject": {
        setOptions([
          { value: "", text: "Select a coefficient" },
          { value: "density", text: "Density" },
        ])

        break
      }

      case "solidObject": {
        setOptions([
          { value: "", text: "Select a coefficient" },
          { value: "mass", text: "Mass" },
        ])

        break
      }
    }
  }, [props.type, props.materialObjectId])

  const newProps = {
    ...props.formInputProps,
    options: options,
  }

  return <FormInput {...newProps} />
}
