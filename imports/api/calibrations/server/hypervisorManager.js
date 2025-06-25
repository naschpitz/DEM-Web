import Hypervisor from "./hypervisor"

/**
 * HypervisorManager - Singleton manager to track Hypervisor instances
 *
 * This class ensures that only one Hypervisor instance exists per calibration ID,
 * preventing duplicate instances and resource conflicts.
 */
class HypervisorManager {
  constructor() {
    this.instances = new Map()
  }

  /**
   * Get existing instance or create new one
   * @param {string} calibrationId - The calibration ID
   * @returns {Hypervisor} The Hypervisor instance
   */
  getInstance(calibrationId) {
    if (this.instances.has(calibrationId)) {
      return this.instances.get(calibrationId)
    }

    const hypervisor = new Hypervisor(calibrationId)
    this.instances.set(calibrationId, hypervisor)
    return hypervisor
  }

  /**
   * Remove instance from tracking
   * @param {string} calibrationId - The calibration ID to remove
   * @returns {boolean} True if instance was removed, false if it didn't exist
   */
  removeInstance(calibrationId) {
    return this.instances.delete(calibrationId)
  }
}

// Global singleton instance
const hypervisorManager = new HypervisorManager()

export default hypervisorManager
