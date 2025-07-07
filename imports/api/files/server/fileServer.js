import { Meteor } from "meteor/meteor"
import { WebApp } from "meteor/webapp"
import { createReadStream, statSync, existsSync } from "fs"
import { join, extname } from "path"
import { lookup } from "mime-types"

import Sceneries from "../../sceneries/both/class"
import Simulations from "../../simulations/both/class"
import Files from "../both/class"

// Custom file serving route
WebApp.connectHandlers.use("/files/download", async (req, res, next) => {
  try {
    // Parse URL to get file ID and token
    const url = new URL(req.url, `http://${req.headers.host}`)
    const pathParts = url.pathname.split("/")
    const fileId = pathParts[1] // /fileId
    const token = url.searchParams.get("xmtok")

    if (!fileId) {
      res.writeHead(400, { "Content-Type": "text/plain" })
      res.end("File ID required")
      return
    }

    // Find the file in database
    const file = await Files.findOneAsync(fileId)

    if (!file) {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("File not found")
      return
    }

    // Check access permissions (same logic as before)
    if (token) {
      try {
        // Handle both old (meta.owner) and new (owner) field structures
        const ownerId = file.owner || file.meta?.owner
        const scenery = await Sceneries.findOneAsync(ownerId)

        if (scenery) {
          const simulationId = scenery.owner
          const simulation = await Simulations.findOneAsync(simulationId)

          if (!simulation || token !== simulation.owner) {
            res.writeHead(403, { "Content-Type": "text/plain" })
            res.end("Access denied")
            return
          }
        } else {
          res.writeHead(403, { "Content-Type": "text/plain" })
          res.end("Access denied")
          return
        }
      } catch (error) {
        console.error("Error checking permissions:", error)
        res.writeHead(500, { "Content-Type": "text/plain" })
        res.end("Server error")
        return
      }
    } else {
      res.writeHead(401, { "Content-Type": "text/plain" })
      res.end("Token required")
      return
    }

    // Construct file path
    const filePath = join(Meteor.settings.s3Path, `${fileId}.mp4`)

    // Check if file exists
    if (!existsSync(filePath)) {
      res.writeHead(404, { "Content-Type": "text/plain" })
      res.end("Physical file not found")
      return
    }

    // Get file stats
    const stats = statSync(filePath)
    const fileSize = stats.size

    // Determine MIME type
    const mimeType = lookup(filePath) || file.type || "application/octet-stream"

    // Handle range requests for video streaming
    const range = req.headers.range

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-")
      const start = parseInt(parts[0], 10)
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
      const chunksize = end - start + 1

      // Create read stream for the range
      const stream = createReadStream(filePath, { start, end })

      // Set partial content headers
      res.writeHead(206, {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${file.name || fileId}"`,
        "Cache-Control": "public, max-age=31536000",
      })

      stream.pipe(res)
    } else {
      // Serve entire file
      res.writeHead(200, {
        "Content-Length": fileSize,
        "Content-Type": mimeType,
        "Content-Disposition": `inline; filename="${file.name || fileId}"`,
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000",
      })

      const stream = createReadStream(filePath)
      stream.pipe(res)
    }
  } catch (error) {
    console.error("File serving error:", error)
    res.writeHead(500, { "Content-Type": "text/plain" })
    res.end("Server error")
  }
})
