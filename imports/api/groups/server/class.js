import Simulations from "../../simulations/both/class"
import GroupsBoth from "../both/class"

export default class Groups extends GroupsBoth {
  static async removeAsync(groupId, removeContents) {
    // Find if this group has running or paused simulations
    const allowedStates = ["new", "stopped", "done", "failed"]
    const activeSimulations = Simulations.find({ group: groupId, state: { $nin: allowedStates } })

    const numActiveSimulations = await activeSimulations.countAsync()

    if (numActiveSimulations > 0) {
      throw { message: "This group and its contents cannot be removed as it contains active simulations" }
    }

    // Remove all simulations from this group
    if (removeContents)
      await Simulations.removeByGroup(groupId)

    // Remove the group, unsetting the group from all simulations that belong to it
    await Simulations.unsetGroup(null, groupId)

    // Finally, remove the group
    await GroupsBoth.removeAsync(groupId)
  }
}