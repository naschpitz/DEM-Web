import React from "react"
import PropTypes from "prop-types"
import { flexRender } from "@tanstack/react-table"

import TablePagination from "./pagination/pagination"
import { padTableData, isEmptyRow } from "./utils"

import "./table.css"

const Table = ({ table, expansionComponent, tableId, padRows = false, emptyText = null }) => {
  // Get the current page size from the table state
  const currentPageSize = table.getState().pagination.pageSize

  // Get the rows to display, with padding if enabled
  const rows = table.getRowModel().rows

  let displayRows = rows

  if (padRows) {
    // Use the utility function to pad the original data, then convert to rows
    const originalData = rows.map(row => row.original)
    const paddedData = padTableData(originalData, currentPageSize)

    // If padding was added, create rows for the padded data
    if (paddedData.length > originalData.length) {
      displayRows = paddedData.map((data, index) => {
        if (isEmptyRow(data)) {
          // Create empty row objects that mimic the structure of real rows
          const emptyRow = {
            id: `empty-${index}`,
            original: data,
            getIsExpanded: () => false,
            toggleExpanded: () => {}, // No-op for empty rows
            getVisibleCells: () => table.getAllColumns().map(column => {
              // Create a wrapped column definition that handles empty rows
              const wrappedColumnDef = { ...column.columnDef }

              // For empty rows, always return null regardless of original cell renderer
              if (column.columnDef.cell) {
                wrappedColumnDef.cell = () => null
              }

              return {
                id: `empty-${index}-${column.id}`,
                column: { columnDef: wrappedColumnDef },
                getContext: () => ({
                  row: emptyRow, // Reference to the complete row object
                  getValue: () => {
                    // Return appropriate default values based on column type
                    return null // Always return null for empty rows
                  }
                })
              }
            }),
          }
          return emptyRow
        } else {
          // Return the original row for real data
          return rows[index]
        }
      })
    }
  }
  
  return (
    <div className="table-responsive">
      {/* Show empty text when there's no data but padRows is enabled */}
      {emptyText && padRows && rows.length === 0 && (
        <div className="empty-table-message">
          <div className="text-center text-muted p-4">
            {emptyText}
          </div>
        </div>
      )}

      <table className="table table-striped table-hover" id={tableId}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className={header.column.columnDef.meta?.className || ""}
                  style={{
                    position: "relative",
                    width: header.getSize(), // Dynamic width
                  }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}

                  {/* Resize handle */}
                  {header.column.getCanResize() && (
                    <div
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                    />
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {displayRows.map(row => (
            <React.Fragment key={row.id}>
              <tr className={isEmptyRow(row.original) ? "empty-row" : ""}>
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={cell.column.columnDef.meta?.className || ""}
                    style={{ verticalAlign: "middle" }}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
              {row.getIsExpanded() && expansionComponent && (
                <tr key={`${row.id}-expanded`}>
                  <td colSpan={row.getVisibleCells().length + 1} style={{ padding: "1rem" }}>
                    {typeof expansionComponent === 'function'
                      ? expansionComponent(row.original)
                      : expansionComponent
                    }
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <TablePagination table={table} />
    </div>
  )
}

Table.propTypes = {
  table: PropTypes.object.isRequired,
  expansionComponent: PropTypes.oneOfType([
    PropTypes.element, // React element (for tables without dynamic props)
    PropTypes.func,    // Function that takes row data and returns a React element
  ]), // Optional expansion component
  tableId: PropTypes.string, // Optional table ID for CSS scoping
  padRows: PropTypes.bool, // Whether to pad rows to fill page size
  emptyText: PropTypes.string, // Text to show when table is empty
}

export default Table
