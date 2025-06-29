/**
 * Utility functions for table operations
 */

/**
 * Pads table data with empty rows to fill up to the specified page size
 * @param {Array} data - The original data array
 * @param {number} pageSize - The target page size
 * @returns {Array} - Data array padded with empty placeholder objects
 */
export const padTableData = (data, pageSize) => {
  if (!Array.isArray(data) || pageSize <= 0) {
    return data
  }

  const currentPageSize = data.length % pageSize
  // If we have data and it's already a full page, no padding needed
  if (currentPageSize === 0 && data.length > 0) {
    return data
  }

  const emptyRowsNeeded = data.length === 0 ? pageSize : pageSize - currentPageSize
  const emptyRows = Array(emptyRowsNeeded)
    .fill(null)
    .map((_, index) => ({
      _isEmpty: true,
      _emptyId: `empty-${index}`,
    }))

  return [...data, ...emptyRows]
}

/**
 * Checks if a row is an empty placeholder row
 * @param {Object} row - The row data
 * @returns {boolean} - True if the row is empty
 */
export const isEmptyRow = row => {
  return row && row._isEmpty === true
}
