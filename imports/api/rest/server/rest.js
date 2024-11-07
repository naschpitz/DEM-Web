import { Meteor } from "meteor/meteor"
import { EJSON } from "meteor/ejson"
import * as zlib from "zlib"

import connectRoute from "connect-route"

import Frames from "../../frames/server/class.js"
import Simulations from "../../simulations/server/class.js"
import Logs from "../../logs/both/class.js"
import Sceneries from "../../sceneries/both/class";

WebApp.connectHandlers.use(
  connectRoute(function (router) {
    router.post("/api/frames", function (req, res, next) {
      let body = []

      req.on("data", chunk => body.push(chunk))
      req.on(
        "end",
        Meteor.bindEnvironment(() => {
          const compressedData = Buffer.concat(body)

          const inflateCallback = Meteor.bindEnvironment((error, data) => {
            const frame = EJSON.parse(data.toString())

            const scenery = Sceneries.findOne(frame.owner)
            if (!scenery) {
              console.log("/api/frames: scenery not found")
              return
            }

            const simulation = Simulations.findOne(scenery.owner)
            if (!simulation) {
              console.log("/api/frames: simulation not found")
              return
            }

            try {
              // Accepts the frame if the simulation instance on the frame is the same as the current simulation
              // instance on the server.
              if (frame.instance === simulation.instance) {
                Frames.insert(frame)
              }
            } catch (error) {
              console.log("/api/frames, error inserting frame: ", error)
            }
          })

          // This runs asynchronously
          zlib.inflate(compressedData, inflateCallback)

          res.end("OK")
        })
      )
      req.on("error", error => {
        res.writeHead(400, "Error receiving frame")
        res.end()
      })
    })
  })
)

WebApp.connectHandlers.use(
  connectRoute(function (router) {
    router.post("/api/logs", function (req, res, next) {
      let body = []

      req.on("data", chunk => body.push(chunk))
      req.on(
        "end",
        Meteor.bindEnvironment(() => {
          const compressedData = Buffer.concat(body)

          const inflateCallback = Meteor.bindEnvironment((error, data) => {
            const simulationLog = EJSON.parse(data.toString())

            const simulation = Simulations.findOne(simulationLog.owner)
            if (!simulation) {
              console.log("/api/logs: simulation not found")
              return
            }

            // Set the state of the simulation and insert the log only if the instance of the simulation currently on
            // the server is same as the one that generated the log.
            try {
              if (simulationLog.instance === simulation.instance) {
                Simulations.setState(simulationLog.owner, simulationLog.state)
                Logs.insert(simulationLog)
              }
            } catch (error) {
              console.log("/api/logs, error inserting log: ", error)
            }
          })

          zlib.inflate(compressedData, inflateCallback)

          // This runs asynchronously
          res.end("OK")
        })
      )
      req.on("error", error => {
        res.writeHead(400, "Error receiving log")
        res.end()
      })
    })
  })
)
