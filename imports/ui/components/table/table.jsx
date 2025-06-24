import React from "react"
import PropTypes from "prop-types"
import { flexRender } from "@tanstack/react-table"

import TablePagination from "./pagination/pagination"

import "./table.css"

const Table = ({ table, expansionComponent, tableId }) => {
  return (
    <>
      <div className="table-responsive">
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
            {table.getRowModel().rows.map(row => (
              <React.Fragment key={row.id}>
                <tr>
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
      </div>

      <TablePagination table={table} />
    </>
  )
}

Table.propTypes = {
  table: PropTypes.object.isRequired,
  expansionComponent: PropTypes.oneOfType([
    PropTypes.element, // React element (for tables without dynamic props)
    PropTypes.func,    // Function that takes row data and returns a React element
  ]), // Optional expansion component
  tableId: PropTypes.string, // Optional table ID for CSS scoping
}

export default Table
