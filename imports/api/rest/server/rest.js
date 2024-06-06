import { Meteor } from "meteor/meteor"
import { EJSON } from "meteor/ejson"
import * as zlib from "zlib"

import connectRoute from "connect-route"

import Frames from "../../frames/server/class.js"
import Simulations from "../../simulations/server/class.js"
import Logs from "../../logs/both/class.js"

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

            try {
              Frames.schema.validate(frame)
            } catch (error) {
              console.log("Error inserting frame: ", error)
            }

            Frames.insert(frame)
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

            Simulations.setState(simulationLog.owner, simulationLog.state)
            Logs.insert(simulationLog)
          })

          zlib.inflate(compressedData, inflateCallback)

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
