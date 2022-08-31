import React, { useEffect, useState } from "react"
import Papa from "papaparse"

import FormInput from "@naschpitz/form-input"

import "./dataImporter.css"

export default DataImporter = props => {
  const [csv, setCsv] = useState("")

  useEffect(() => {
    if (!props.xData || !props.yData) return

    // Return multiple arrays containing a pair of each element from props.xData and props.yData
    const data = props.xData.map((xData, i) => [xData, props.yData[i]])

    const csv = Papa.unparse(data)
  }, [props.xData, props.yData])

  function onEvent(event, name, value) {
    if (!props.onData) return
    if (event !== "onBlur" && event !== "onChange") return

    const result = Papa.parse(value, { dynamicTyping: true })

    if (result.errors.length > 0) {
      Alert.error("Error: " + result.errors[0].message)
      return
    }

    // Return the first element of each array in result.data array as an xData array,
    // and the second element of each array in result.data array as an yData array.
    function getXandYData(data) {
      const xData = []
      const yData = []

      for (let i = 0; i < data.length; i++) {
        xData.push(data[i][0])
        yData.push(data[i][1])
      }

      return { xData, yData }
    }

    const { xData, yData } = getXandYData(result.data)
    props.onData({ xData, yData })
  }

  return (
    <FormInput
      label="CSV Data"
      name="csv"
      value={csv}
      type="textarea"
      rows={10}
      labelPos="top"
      labelSizes={{ sm: 12, md: 12, lg: 12 }}
      inputSizes={{ sm: 12, md: 12, lg: 12 }}
      onEvent={onEvent}
    />
  )
}
