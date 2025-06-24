import Cameras from "../../cameras/both/class.js"
import Frames from "../../frames/server/class.js"
import Materials from "../../materials/both/class.js"
import NonSolidObjects from "../../nonSolidObjects/both/class.js"
import SceneriesBoth from "../../sceneries/both/class.js"
import SolidObjects from "../../solidObjects/both/class.js"
import Videos from "../../videos/both/class"

export default class Sceneries extends SceneriesBoth {
  static async resetByOwner(simulationId) {
    const scenery = await SceneriesBoth.findOneAsync({ owner: simulationId })

    await Frames.removeByOwner(scenery._id)
  }

  static async removeByOwner(simulationId) {
    const scenery = await SceneriesBoth.findOneAsync({ owner: simulationId })

    if (!scenery) return

    const sceneryId = scenery._id

    const promises = []

    promises.push(Frames.removeByOwner(sceneryId))
    promises.push(NonSolidObjects.removeByOwner(sceneryId))
    promises.push(SolidObjects.removeByOwner(sceneryId))
    promises.push(Materials.removeByOwner(sceneryId))
    promises.push(Cameras.removeByOwner(sceneryId))
    promises.push(Videos.removeByOwner(sceneryId))

    await Promise.allSettled(promises)

    await SceneriesBoth.removeAsync(sceneryId)
  }

  static async setStorage(sceneryId, newStorage) {
    const scenery = await SceneriesBoth.findOneAsync(sceneryId)
    const currentStorage = scenery.storage

    if (currentStorage === newStorage) return

    await Frames.setStorage(sceneryId, currentStorage, newStorage)

    await SceneriesBoth.updateAsync(sceneryId, { $set: { storage: newStorage } })
  }
}
