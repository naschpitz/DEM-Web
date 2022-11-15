import React, { useState, useEffect } from "react"
import { Meteor } from "meteor/meteor"
import { useTracker } from "meteor/react-meteor-data"
import PropTypes from "prop-types"
import _ from "lodash"

import FramesClass from "../../../../../../../api/frames/both/class.js"

import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts"
import Alert from "react-s-alert"

import "./chart.css"

export default Chart = ({ sceneryId, objectId, dataName, minInterval, maxInterval }) => {
  const [isReady, setIsReady] = useState(false)

  useTracker(() => {
    Meteor.subscribe("frames", sceneryId, {
      onStop: error => (error ? Alert.error("Error: " + getErrorMessage(error)) : null),
      onReady: () => setIsReady(true),
    })
  }, [sceneryId])

  const data = useTracker(() => {
    const filter = []

    if (minInterval) filter.push({ time: { $gte: minInterval } })
    if (maxInterval) filter.push({ time: { $lte: maxInterval } })

    const selector = {
      owner: sceneryId,
      $or: [{ "scenery.objects.nonSolidObjects._id": objectId }, { "scenery.objects.solidObjects._id": objectId }],
    }

    if (minInterval || maxInterval) selector.$and = filter

    const frames = FramesClass.find(selector).fetch()

    const data = []

    frames.forEach(frame => {
      let object = null

      const nonSolidObjects = _.get(frame, "scenery.objects.nonSolidObjects", null)

      if (nonSolidObjects) {
        object = nonSolidObjects.find(nonSolidObject => nonSolidObject._id === objectId)
      }

      const solidObjects = _.get(frame, "scenery.objects.solidObjects", null)

      if (solidObjects && !object) {
        object = solidObjects.find(solidObject => solidObject._id === objectId)
      }

      data.push({ x: frame.time, y: _.get(object, dataName) })
    })

    return data
  })

  return (
    <div id="chart">
      <ResponsiveContainer minHeight={100} aspect={3}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }} W>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#21426E" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#21426E" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="x" tickFormatter={value => value.toExponential(3)} />
          <YAxis dataKey="y" tickFormatter={value => value.toExponential()} />
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
