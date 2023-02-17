import React, { useState, useEffect } from "react"

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import styles from "./chart.module.css"

export default Chart = props => {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!props.data) return

    console.log(props.data)

    const data = props.data.map(data => ({ x: data[0], y: data[1] }))
    setData(data)
  }, [props.data])

  return (
    <div id={styles.chart}>
      <ResponsiveContainer minHeight={100}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} W>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#21426E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#21426E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tickFormatter={value => value.toExponential(3)} scale="linear" />
          <YAxis dataKey="y" tickFormatter={value => value.toExponential()} scale="linear" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="y"
            stroke="#112349"
            dot={{ stroke: "#112349", strokeWidth: 3 }}
            fillOpacity={1}
            fill="url(#colorUv)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
