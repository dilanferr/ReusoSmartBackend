import React from 'react'

export const Table = ({ children }) => (
  <table className="w-full text-left border-collapse">{children}</table>
)

export const TableHeader = ({ children }) => (
  <thead className="bg-emerald-50 border-b border-emerald-100">{children}</thead>
)

export const TableRow = ({ children }) => (
  <tr className="border-b border-emerald-100">{children}</tr>
)

export const TableCell = ({ children }) => (
  <td className="p-3 text-gray-800">{children}</td>
)

export const TableBody = ({ children }) => (
  <tbody>{children}</tbody>
)

export default Table