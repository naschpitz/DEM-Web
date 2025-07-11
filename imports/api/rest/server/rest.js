import { Meteor } from "meteor/meteor"
import { EJSON } from "meteor/ejson"
import { inflateWithPigz } from "../../utils/pigz.js"
import zlib from "zlib"

import connectRoute from "connect-route"

import Frames from "../../frames/server/class"
import Simulations from "../../simulations/server/class"
import Logs from "../../logs/both/class"
import Sceneries from "../../sceneries/both/class"

WebApp.connectHandlers.use(
  connectRoute(function (router) {
    router.post("/api/frames", function (req, res, next) {
      const body = []

      req.on("data", chunk => body.push(chunk))
      req.on(
        "end",
        Meteor.bindEnvironment(async () => {
          const deflatedData = Buffer.concat(body)

          try {
            const inflatedData = await inflateWithPigz(deflatedData)

            try {
              const frame = EJSON.parse(inflatedData.toString())

              const scenery = await Sceneries.findOneAsync(frame.owner)
              if (!scenery) {
                console.log("/api/frames: scenery not found")
                return
              }

              const simulation = await Simulations.findOneAsync(scenery.owner)
              if (!simulation) {
                console.log("/api/frames: simulation not found")
                return
              }

              if (frame.instance === simulation.instance) {
                await Frames.insertAsync(frame)
              }
            } catch (error) {
              console.log("/api/frames, error inserting frame: ", error)
            }

            res.end("OK")
          } catch (error) {
            console.log("/api/frames, error inflating frame: ", error)
            res.writeHead(400, "Decompression failed")
            res.end()
          }
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
        Meteor.bindEnvironment(async () => {
          const deflatedData = Buffer.concat(body)
          const inflatedData = await inflateWithPigz(deflatedData)

          const simulationLog = EJSON.parse(inflatedData.toString())

          const simulation = await Simulations.findOneAsync(simulationLog.owner)
          if (!simulation) {
            console.log("/api/logs: simulation not found")
            return
          }

          // Set the state of the simulation and insert the log only if the instance of the simulation currently on
          // the server is same as the one that generated the log.
          try {
            if (simulationLog.instance === simulation.instance) {
              await Simulations.setState(simulationLog.owner, simulationLog.state)
              await Logs.insertAsync(simulationLog)
            }
          } catch (error) {
            console.log("/api/logs, error inserting log: ", error)
          }

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
