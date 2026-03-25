import { Eye, Edit, Trash2 } from 'lucide-react'
import { Checkbox, Tooltip } from '../atoms'
import clsx from 'clsx'

const TableRow = ({
  data,
  columns,
  selected = false,
  onSelect,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  showCheckbox = false,
  className = '',
}) => {
  const handleCheckboxChange = e => {
    if (onSelect) {
      onSelect(data, e.target.checked)
    }
  }

  const renderCellContent = (column, value) => {
    if (column.render) {
      return column.render(value, data)
    }
    return value || '-'
  }

  return (
    <tr
      className={clsx(
        'border-b border-gray-200 hover:bg-gray-50 transition-colors',
        selected && 'bg-blue-50',
        className
      )}
    >
      {/* Checkbox Column */}
      {showCheckbox && (
        <td className="px-4 py-3 w-12">
          <Checkbox checked={selected} onChange={handleCheckboxChange} aria-label="Select row" />
        </td>
      )}

      {/* Data Columns */}
      {columns.map(column => (
        <td key={column.key} className={clsx('px-4 py-3 text-sm text-gray-900', column.className)}>
          {renderCellContent(column, data[column.key])}
        </td>
      ))}

      {/* Actions Column */}
      {showActions && (onView || onEdit || onDelete) && (
        <td className="px-4 py-3 w-32">
          <div className="flex items-center gap-2 justify-end">
            {onView && (
              <Tooltip content="View details">
                <button
                  onClick={() => onView(data)}
                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                  aria-label="View"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip content="Edit">
                <button
                  onClick={() => onEdit(data)}
                  className="p-1.5 text-green-600 hover:bg-green-100 rounded transition-colors"
                  aria-label="Edit"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip content="Delete">
                <button
                  onClick={() => onDelete(data)}
                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </Tooltip>
            )}
          </div>
        </td>
      )}
    </tr>
  )
}

export default TableRow
