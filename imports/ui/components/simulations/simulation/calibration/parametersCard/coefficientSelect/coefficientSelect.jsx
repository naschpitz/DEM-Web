import React, { useEffect, useState } from "react"
import { Meteor } from "meteor/meteor"

import Alert from "react-s-alert-v3"

import FormInput from "@naschpitz/form-input"
import { getDragForcesCoefficientsOptions, getForcesCoefficientsOptions } from "../../../../../../common/materials"

export default CoefficientSelect = props => {
  const [options, setOptions] = useState([])

  useEffect(() => {
    if (!props.type || !props.materialObjectId) return

    switch (props.type) {
      case "material": {
        Meteor.call("materials.getById", props.materialObjectId, (error, result) => {
          if (error) {
            Alert.error("Error: " + getErrorMessage(error))
          }

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
