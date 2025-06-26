import { useState } from "react"

/**
 * Custom hook for managing a Set-based boolean state for multiple items.
 * Useful for tracking loading states, selection states, etc. for individual items in lists/tables.
 *
 * @returns {Object} Object containing:
 *   - isState: Set containing IDs of items that are in the "true" state
 *   - getState: Function to check if an item is in the "true" state
 *   - setState: Function to set an item's state (true adds to Set, false removes from Set)
 *   - clearState: Function to clear all items from the state
 */
export default function useIsState() {
  const [isState, setIsState] = useState(new Set())

  /**
   * Check if an item is in the "true" state
   * @param {string|number} itemId - The ID of the item to check
   * @returns {boolean} True if the item is in the state Set, false otherwise
   */
  function getState(itemId) {
    return isState.has(itemId)
  }

  /**
   * Set an item's state
   * @param {string|number} itemId - The ID of the item
   * @param {boolean} value - True to add to Set, false to remove from Set
   */
  function setState(itemId, value) {
    const newIsState = new Set(isState)

    if (value) {
      newIsState.add(itemId)
    } else {
      newIsState.delete(itemId)
    }

    setIsState(newIsState)
  }

  /**
   * Clear all items from the state
   */
  function clearState() {
    setIsState(new Set())
  }

  return {
    isState,
    getState,
    setState,
    clearState,
  }
}
