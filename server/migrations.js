import { Random } from "meteor/random"
import { MongoInternals } from "meteor/mongo"

import { existsSync, readdirSync } from "fs"

import Agents from "../imports/api/agents/both/collection"
import AgentsHistories from "../imports/api/agentsHistories/both/collection"
import Calibrations from "../imports/api/calibrations/both/collection"
import DataSets from "../imports/api/dataSets/both/collection"
import Files from "../imports/api/files/both/collection"
import Frames from "../imports/api/frames/both/collection"
import FramesServer from "../imports/api/frames/server/class"
import Logs from "../imports/api/logs/both/collection"
import Materials from "../imports/api/materials/both/collection"
import NonSolidObjects from "../imports/api/nonSolidObjects/both/collection"
import ObjectsProperties from "../imports/api/objectsProperties/both/collection"
import Sceneries from "../imports/api/sceneries/both/collection"
import Simulations from "../imports/api/simulations/both/collection"
import SolidObjects from "../imports/api/solidObjects/both/collection"

Migrations.add({
  version: 1,
  name: "Add a call sign to Materials, SolidObjects and NonSolidObjects",
  up: async () => {
    const update = () => ({ $set: { callSign: Random.id() } })

    await Materials.find().forEachAsync(async material => {
      await Materials.updateAsync(material._id, update(), { validate: false, multi: true })
    })

    await SolidObjects.find().forEachAsync(async solidObject => {
      await SolidObjects.updateAsync(solidObject._id, update(), { validate: false, multi: true })
    })

    await NonSolidObjects.find().forEachAsync(async nonSolidObject => {
      await NonSolidObjects.updateAsync(nonSolidObject._id, update(), { validate: false, multi: true })
    })
  },
  down: async () => {
    const update = { $unset: { callSign: "" } }

    await Materials.updateAsync({}, update, { validate: false, multi: true })
    await SolidObjects.updateAsync({}, update, { validate: false, multi: true })
    await NonSolidObjects.updateAsync({}, update, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 2,
  name: "Add 'primary' property to Simulations",
  up: async () => {
    const update = { $set: { primary: true } }

    await Simulations.updateAsync({}, update, { validate: false, multi: true })
  },
  down: async () => {
    const update = { $unset: { primary: "" } }

    await Simulations.updateAsync({}, update, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 3,
  name: "Rename 'simulationsLogs' collection to 'log'",
  up: () => {
    Logs.rawCollection().rename("logs")
  },
  down: () => {
    Logs.rawCollection().rename("simulationsLogs")
  },
})

Migrations.add({
  version: 4,
  name: "Change DataSet to the new schema format",
  up: async () => {
    await DataSets.find({}).forEachAsync(async dataSet => {
      const newData = dataSet.data.map(data => ({
        time: data[0],
        value: data[1],
      }))

      await DataSets.updateAsync(dataSet._id, { $set: { data: newData } })
    })
  },
  down: async () => {
    await DataSets.find({}).forEachAsync(async dataSet => {
      const newData = dataSet.data.map(data => [data.time, data.value])

      await DataSets.updateAsync(dataSet._id, { $set: { data: newData } })
    })
  },
})

Migrations.add({
  version: 5,
  name: "Add 'weight' property to DataSets",
  up: async () => {
    await DataSets.updateAsync({}, { $set: { weight: 1 } }, { validate: false, multi: true })
  },
  down: async () => {
    await DataSets.updateAsync({}, { $unset: { weight: "" } }, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 6,
  name: "Add 'numIterations' and 'minPercentage' property to Calibration",
  up: async () => {
    await Calibrations.updateAsync(
      {},
      { $set: { numIterations: 3, minPercentage: 0.01 } },
      { validate: false, multi: true }
    )
  },
  down: async () => {
    await Calibrations.updateAsync(
      {},
      { $unset: { numIterations: "", minPercentage: "" } },
      { validate: false, multi: true }
    )
  },
})

Migrations.add({
  version: 7,
  name: "Change Calibrations property name 'numIterations' to 'numIntervals'",
  up: () => {
    Calibrations.rawCollection().updateMany({}, { $rename: { numIterations: "numIntervals" } })
  },
  down: () => {
    Calibrations.rawCollection().updateMany({}, { $rename: { numIntervals: "numIterations" } })
  },
})

Migrations.add({
  version: 8,
  name: "Copy Agents' history array to the AgentsHistory collection",
  up: async () => {
    // For each Agent
    await Agents.find().forEachAsync(async agent => {
      // For each history in the Agent
      for (const history of agent.history) {
        const agentHistory = {
          owner: agent._id,
          ...history,
        }

        // Insert the history in the AgentsHistories collection
        await AgentsHistories.insertAsync(agentHistory)
      }

      // Remove the history from the Agent
      await Agents.updateAsync(agent._id, { $unset: { history: "" } })
    })
  },
  down: async () => {
    // For Each Agent
    await Agents.find().forEachAsync(async agent => {
      // Find the Agent's histories
      const agentHistories = await AgentsHistories.find({ owner: agent._id }, { sort: { iteration: 1 } }).fetchAsync()

      // Build the history array from the AgentHistories
      const history = agentHistories.map(agentHistory => {
        return {
          iteration: agentHistory.iteration,
          current: agentHistory.current,
          best: agentHistory.best,
        }
      })

      // Update the Agent with the history
      await Agents.updateAsync(agent._id, { $set: { history } })
    })

    // Remove the AgentHistories collection
    AgentsHistories.rawCollection().drop()
  },
})

Migrations.add({
  version: 9,
  name: "Migrate videos collection to generic files collection",
  up: async () => {
    // Use raw MongoDB driver to avoid collection name conflicts
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db
    const videosCollection = db.collection("videos")
    const filesCollection = db.collection("files")

    // Check if there are any documents in the videos collection
    const videosCount = await videosCollection.countDocuments()

    if (videosCount > 0) {
      console.log(`Found ${videosCount} videos to migrate to files collection`)

      // Get all videos
      const videos = await videosCollection.find({}).toArray()

      for (const video of videos) {
        // Transform the video document to the new files structure
        const fileDoc = {
          _id: video._id,
          owner: video.meta?.owner || video.owner,
          name: video.name,
          path: video.path,
          size: video.size,
          type: video.type || "video/mp4",
          isVideo: true,
          isAudio: false,
          isImage: false,
          isText: false,
          isJSON: false,
          isPDF: false,
          state: video.meta?.state || video.state,
          error: video.meta?.error || video.error,
          notes: video.meta?.notes || video.notes,
          createdAt: video.meta?.createdAt || video.createdAt || new Date(),
          updatedAt: video.updatedAt || new Date(),
        }

        // Insert into files collection
        try {
          await filesCollection.insertOne(fileDoc)
          console.log(`Migrated video ${video._id} to files collection`)
        } catch (error) {
          if (error.code === 11000) {
            // Document already exists, skip
            console.log(`Video ${video._id} already exists in files collection, skipping`)
          } else {
            console.error(`Error migrating video ${video._id}:`, error)
          }
        }
      }

      console.log("Video to files migration completed")
    } else {
      console.log("No videos found to migrate")
    }
  },
  down: async () => {
    // Use raw MongoDB driver
    const db = MongoInternals.defaultRemoteCollectionDriver().mongo.db
    const videosCollection = db.collection("videos")
    const filesCollection = db.collection("files")

    // Find all video files in the files collection
    const videoFiles = await filesCollection.find({ isVideo: true }).toArray()

    for (const file of videoFiles) {
      // Transform back to the old videos structure
      const videoDoc = {
        _id: file._id,
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.type,
        meta: {
          owner: file.owner,
          state: file.state,
          error: file.error,
          notes: file.notes,
          createdAt: file.createdAt,
        },
        updatedAt: file.updatedAt,
      }

      // Insert back into videos collection
      try {
        await videosCollection.insertOne(videoDoc)
        console.log(`Restored video ${file._id} to videos collection`)
      } catch (error) {
        console.error(`Error restoring video ${file._id}:`, error)
      }
    }

    // Remove video files from files collection
    await filesCollection.deleteMany({ isVideo: true })
    console.log("Video files removed from files collection")
  },
})

Migrations.add({
  version: 10,
  name: "Add 'display' property to ObjectsProperties",
  up: async () => {
    await ObjectsProperties.updateAsync({}, { $set: { display: true } }, { validate: false, multi: true })
  },
  down: async () => {
    await ObjectsProperties.updateAsync({}, { $unset: { display: "" } }, { validate: false, multi: true })
  },
})

Migrations.add({
  version: 11,
  name: "Add 'detailedFramesDiv' property to Simulations and 'detailed' property to Frames",
  up: async () => {
    // Add detailedFramesDiv to Simulations
    await Simulations.updateAsync({}, { $set: { detailedFramesDiv: 1 } }, { validate: false, multi: true })

    // Add detailed property to Frames
    // Process each frame to determine if it's detailed
    await Frames.find().forEachAsync(async frame => {
      let isDetailed = false

      try {
        // Get the scenery to determine storage path
        const scenery = await Sceneries.findOneAsync(frame.owner)
        if (!scenery) return

        const currentStoragePath = FramesServer.getStoragePath(scenery.storage)
        if (!currentStoragePath || !existsSync(currentStoragePath)) return

        // Check if any files exist for this frame
        // File pattern: {sceneryId}-{frameId}-{objectId}
        const frameFilePattern = frame.owner + "-" + frame._id + "-"

        const files = readdirSync(currentStoragePath)
        isDetailed = files.some(file => file.startsWith(frameFilePattern))
      } catch (error) {
        console.log(`Error checking frame ${frame._id} for detailed files:`, error)
        // Default to false if we can't determine
        isDetailed = false
      }

      // Update the frame with the detailed flag
      await Frames.updateAsync(frame._id, { $set: { detailed: isDetailed } }, { validate: false })
    })
  },
  down: async () => {
    await Simulations.updateAsync({}, { $unset: { detailedFramesDiv: "" } }, { validate: false, multi: true })
    await Frames.updateAsync({}, { $unset: { detailed: "" } }, { validate: false, multi: true })
  },
})
