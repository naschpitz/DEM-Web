import React, { useState, useEffect } from "react"

import { ResponsiveContainer, ComposedChart, Area, Line, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import { Wrapper } from "./chart.styles"

export default (props) => {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!props.data) return

    const data = props.data.referenceData.map(data => {
      const time = data.time
      const referenceValue = data.value

      const simulationValue = props.data.simulationData.find(simulationData => simulationData.time === time).value
      const errorValue = props.data.errorData.find(errorData => errorData.time === time).value

      return {
        x: time,
        yReference: referenceValue,
        ySimulation: simulationValue,
        yError: errorValue
      }
    })

    setData(data)
  }, [props.data])

  return (
    <Wrapper>
      <ResponsiveContainer minHeight={300}>
        <ComposedChart data={data} margin={{ top: 10, right: 0, left: 10, bottom: 0 }} W>
          <defs>
            <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#21426E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#21426E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tickFormatter={value => value.toExponential(3)} domain={['auto', 'auto']} scale="linear" type="number" />
          <YAxis orientation="left" yAxisId="left"/>
          <YAxis orientation="right" yAxisId="right" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="ySimulation"
            stroke="#112349"
            dot={{ stroke: "#112349", strokeWidth: 3 }}
            fillOpacity={1}
            fill="url(#colorData)"
            yAxisId="left"
          />
          <Line
            type="monotone"
            dataKey="yReference"
            stroke="#00AA33"
            dot={{ stroke: "#00AA33", strokeWidth: 3 }}
            yAxisId="left"
          />
          <Bar
            dataKey="yError"
            yAxisId="right"
            barSize={20}
            fill="#AA0000"
            fillOpacity={0.5}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Wrapper>
  )
}
