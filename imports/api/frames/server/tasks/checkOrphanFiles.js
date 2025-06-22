import { Meteor } from "meteor/meteor"
import { readdirSync, unlink, unlinkSync } from "fs"

import Frames from "../../server/class"

// Find stalled Simulations and set its state to 'failed'
const bound = Meteor.bindEnvironment(async () => {
  const localFilesToRemove = []
  const s3FilesToRemove = []

  // First look for the files in the local storage, then in the S3 storage.
  const localFiles = readdirSync(Meteor.settings.localPath)
  for (const file of localFiles) {
    // Extract the frameId from the filename, the format is "sceneryId-frameId-objectId"
    const match = file.match(/.*-(.*)-.*/)

    if (match !== null) {
      const frameId = match[1]

      const frame = await Frames.findOneAsync(frameId)

      if (!frame) localFilesToRemove.push(Meteor.settings.localPath + "/" + file)
    }
  }

  const s3Files = readdirSync(Meteor.settings.s3Path)
  for (const file of s3Files) {
    // Extract the frameId from the filename, the format is "sceneryId-frameId-objectId"
    const match = file.match(/.*-(.*)-.*/)

    if (match !== null) {
      const frameId = match[1]

      const frame = await Frames.findOneAsync(frameId)

      if (!frame) s3FilesToRemove.push(Meteor.settings.s3Path + "/" + file)
    }
  }

  localFilesToRemove.forEach(file => {
    unlink(file, error => {
      /* Do nothing */
    })
  })

  s3FilesToRemove.forEach(file => {
    try {
      unlinkSync(file)
    } catch (error) {
      /* Do nothing */
    }
  })

  console.log(`Removed ${localFilesToRemove.length} orphan files from local storage.`)
  console.log(`Removed ${s3FilesToRemove.length} orphan files from S3 storage.`)
})

const task = (ready) => {
  bound()
  ready()
}

export default task