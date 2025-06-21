import React, { useState, useEffect } from "react"

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"

import styles from "./chart.module.css"

export default (props) => {
  const [data, setData] = useState([])

  useEffect(() => {
    if (!props.data) return

    const data = props.data.map(data => ({ x: data.time, y: data.value }))

    setData(data)
  }, [props.data])

  return (
    <div id={styles.chart}>
      <ResponsiveContainer minHeight={100}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 10, bottom: 0 }} W>
          <defs>
            <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#21426E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#21426E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tickFormatter={value => value.toExponential(3)} domain={['auto', 'auto']} scale="linear" type="number" />
          <YAxis dataKey="y" tickFormatter={value => value.toExponential(3)} domain={['auto', 'auto']} scale="linear" type="number" />
          <CartesianGrid strokeDasharray="3 3" />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="y"
            stroke="#112349"
            dot={{ stroke: "#112349", strokeWidth: 3 }}
            fillOpacity={1}
            fill="url(#colorData)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
