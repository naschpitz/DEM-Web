import React from "react"
import PropTypes from "prop-types"

import "./pagination.css"

const TablePagination = ({ table }) => {
  return (
    <div className="pagination-wrapper">
      <div className="pagination-controls">
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
        >
          {"<<"}
        </button>
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>

        <div className="pagination-info">
          <span className="page-text">Page</span>
          <input
            type="number"
            className="page-input"
            value={table.getState().pagination.pageIndex + 1}
            onChange={e => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0
              table.setPageIndex(page)
            }}
            min="1"
            max={table.getPageCount()}
          />
          <span className="page-text">of {table.getPageCount()}</span>
        </div>

        <select
          className="form-control page-size-select"
          value={table.getState().pagination.pageSize}
          onChange={e => {
            table.setPageSize(Number(e.target.value))
          }}
        >
          {[5, 10, 20, 30, 40, 50].map(pageSize => (
            <option key={pageSize} value={pageSize}>
              {pageSize} rows
            </option>
          ))}
        </select>

        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
        <button
          className="btn btn-secondary pagination-btn"
          onClick={() => table.setPageIndex(table.getPageCount() - 1)}
          disabled={!table.getCanNextPage()}
        >
          {">>"}
        </button>
      </div>
    </div>
  )
}

TablePagination.propTypes = {
  table: PropTypes.object.isRequired,
}

export default TablePagination
