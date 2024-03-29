import Simulations from "../../simulations/both/class"
import GroupsBoth from "../both/class"

export default class Groups extends GroupsBoth {
  static remove(groupId, removeContents) {
    // Find if this group has running or paused simulations
    const allowedStates = ["new", "stopped", "done", "failed"]
    const activeSimulations = Simulations.find({ group: groupId, state: { $nin: allowedStates } })

    if (activeSimulations.count() > 0) {
      throw { message: "This group and its contents cannot be removed as it contains active simulations" }
    }

    // Remove all simulations from this group
    if (removeContents)
      Simulations.removeByGroup(groupId)

    // Remove the group, unsetting the group from all simulations that belong to it
    Simulations.unsetGroup(null, groupId)

    // Finally, remove the group
    GroupsBoth.remove(groupId)
  }
}