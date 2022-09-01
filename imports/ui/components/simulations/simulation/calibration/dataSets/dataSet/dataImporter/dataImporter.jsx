import React, { useEffect, useState } from "react"
import Papa from "papaparse"

import FormInput from "@naschpitz/form-input"

import "./dataImporter.css"

export default DataImporter = props => {
  const [csv, setCsv] = useState("")

  useEffect(() => {
    if (!props.data) return

    setCsv(Papa.unparse(props.data))
  }, [props.data])

  function onEvent(event, name, value) {
    if (!props.onData) return
    if (event !== "onChange") return

    const result = Papa.parse(value, { dynamicTyping: true })

    if (result.errors.length > 0) {
      Alert.error("Error: " + result.errors[0].message)
      return
    }

    props.onData(result.data)
  }

  return (
    <div className="dataImporter">
      <FormInput
        label="CSV Data"
        labelPos="top"
        name="csv"
        value={csv}
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
