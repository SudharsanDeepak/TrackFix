import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { Checkbox, Spinner, Button } from '../atoms'
import { TableRow } from '../molecules'
import clsx from 'clsx'

const DataTable = ({
  columns = [],
  data = [],
  loading = false,
  error = null,
  emptyMessage = 'No data available',
  // Pagination
  currentPage = 1,
  pageSize = 20,
  totalItems = 0,
  onPageChange,
  onPageSizeChange,
  // Sorting
  sortColumn = null,
  sortDirection = 'asc',
  onSort,
  // Selection
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  // Actions
  onView,
  onEdit,
  onDelete,
  showActions = true,
  className = '',
}) => {
  const [hoveredRow, setHoveredRow] = useState(null)

  const totalPages = Math.ceil(totalItems / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handleSort = columnKey => {
    if (!onSort) return

    if (sortColumn === columnKey) {
      // Toggle direction
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
      onSort(columnKey, newDirection)
    } else {
      // New column, default to asc
      onSort(columnKey, 'asc')
    }
  }

  const handleSelectAll = checked => {
    if (onSelectAll) {
      onSelectAll(checked ? data : [])
    }
  }

  const handleSelectRow = (row, checked) => {
    if (onSelectRow) {
      onSelectRow(row, checked)
    }
  }

  const isRowSelected = row => {
    return selectedRows.some(selected => selected.id === row.id)
  }

  const allSelected = data.length > 0 && selectedRows.length === data.length
  const someSelected = selectedRows.length > 0 && !allSelected

  const renderSortIcon = columnKey => {
    if (sortColumn !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-ir-blue" />
    ) : (
      <ChevronDown className="h-4 w-4 text-ir-blue" />
    )
  }

  const pageSizeOptions = [10, 20, 50, 100]

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1)
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        pages.push(1)
        pages.push('...')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }, [currentPage, totalPages])

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className={clsx('bg-white rounded-lg border border-gray-200', className)}>
      {/* Table Container with Horizontal Scroll */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {/* Select All Checkbox */}
              {selectable && (
                <th className="px-4 py-3 w-12">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={e => handleSelectAll(e.target.checked)}
                    aria-label="Select all rows"
                  />
                </th>
              )}

              {/* Column Headers */}
              {columns.map(column => (
                <th
                  key={column.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider',
                    column.sortable && 'cursor-pointer select-none hover:bg-gray-100',
                    column.headerClassName
                  )}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}

              {/* Actions Header */}
              {showActions && (onView || onEdit || onDelete) && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider w-32">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}
                  className="px-4 py-12 text-center"
                >
                  <Spinner size="lg" className="mx-auto" />
                  <p className="text-sm text-gray-500 mt-2">Loading data...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map(row => (
                <TableRow
                  key={row.id}
                  data={row}
                  columns={columns}
                  selected={isRowSelected(row)}
                  onSelect={handleSelectRow}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  showActions={showActions}
                  showCheckbox={selectable}
                  onMouseEnter={() => setHoveredRow(row.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && data.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-gray-200">
          {/* Items Info */}
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalItems}</span> results
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-2">
            {/* Page Size Selector */}
            <select
              value={pageSize}
              onChange={e => onPageSizeChange?.(Number(e.target.value))}
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ir-blue"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>

            {/* Page Numbers */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>

              {pageNumbers.map((page, index) =>
                page === '...' ? (
                  <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={clsx(
                      'px-3 py-1 text-sm rounded transition-colors',
                      currentPage === page
                        ? 'bg-ir-blue text-white font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    {page}
                  </button>
                )
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DataTable
