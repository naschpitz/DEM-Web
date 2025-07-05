import React, { useMemo } from "react"
import { useReactTable, getCoreRowModel, getPaginationRowModel, createColumnHelper } from "@tanstack/react-table"
import moment from "moment"

import Table from "../../../../table/table.jsx"
import LogsClass from "../../../../../../api/logs/both/class.js"

import "./table.css"

export default function LogTable({ logs }) {
  const columnHelper = createColumnHelper()

  // Transform logs data for the table
  const data = useMemo(() => {
    if (!logs || !Array.isArray(logs)) return []

    return logs
      .filter(log => log.message) // Only include logs with messages
      .map(log => ({
        _id: log._id,
        createdAt: log.createdAt,
        message: log.message,
        state: log.state,
        progress: log.progress,
        formattedDate: moment(log.createdAt).format("L HH:mm:ss"),
        stateDisplay: LogsClass.getState(log),
        progressDisplay: log.progress ? `${log.progress.step}/${log.progress.totalSteps}` : null,
        percentageDisplay: log.progress ? LogsClass.getPercentage(log).text : null,
      }))
  }, [logs])

  const columns = useMemo(
    () => [
      columnHelper.accessor("formattedDate", {
        id: "timestamp",
        header: "Timestamp",
        meta: { className: "text-center" },
        size: 150,
      }),
      columnHelper.accessor("message", {
        id: "message",
        header: "Message",
        cell: info => (
          <div className="log-message-cell" title={info.getValue()}>
            {info.getValue()}
          </div>
        ),
        meta: { className: "text-center" },
        size: 600,
      }),
      columnHelper.accessor("stateDisplay", {
        id: "state",
        header: "State",
        meta: { className: "text-center" },
        size: 100,
      }),
      columnHelper.accessor("progressDisplay", {
        id: "progress",
        header: "Progress",
        meta: { className: "text-center" },
        size: 120,
      }),
      columnHelper.accessor("percentageDisplay", {
        id: "percentage",
        header: "Percentage",
        meta: { className: "text-center" },
        size: 100,
      }),
    ],
    [columnHelper]
  )

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true,
    columnResizeMode: "onChange",
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageSize: 10,
      },
      columnSizing: {
        timestamp: 150,
        message: 600,
        state: 100,
        progress: 120,
        percentage: 100,
      },
    },
  })

  return (
    <div id="logTable">
      <Table table={table} tableId="logTable" padRows={true} emptyText="No log messages available" />
    </div>
  )
}
