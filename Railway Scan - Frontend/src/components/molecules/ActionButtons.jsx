import { useState } from 'react'
import { Edit, Trash2, Download, MoreVertical } from 'lucide-react'
import { Tooltip } from '../atoms'
import clsx from 'clsx'

const ActionButtons = ({
  actions = [],
  onEdit,
  onDelete,
  onExport,
  showEdit = false,
  showDelete = false,
  showExport = false,
  confirmDelete = true,
  deleteMessage = 'Are you sure you want to delete this item?',
  className = '',
}) => {
  const [showConfirm, setShowConfirm] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const handleDelete = () => {
    if (confirmDelete) {
      setShowConfirm(true)
    } else {
      onDelete?.()
    }
  }

  const handleConfirmDelete = () => {
    onDelete?.()
    setShowConfirm(false)
  }

  const handleCancelDelete = () => {
    setShowConfirm(false)
  }

  const defaultActions = []
  if (showEdit && onEdit) {
    defaultActions.push({
      icon: Edit,
      label: 'Edit',
      onClick: onEdit,
      color: 'green',
    })
  }
  if (showDelete && onDelete) {
    defaultActions.push({
      icon: Trash2,
      label: 'Delete',
      onClick: handleDelete,
      color: 'red',
    })
  }
  if (showExport && onExport) {
    defaultActions.push({
      icon: Download,
      label: 'Export',
      onClick: onExport,
      color: 'blue',
    })
  }

  const allActions = [...defaultActions, ...actions]

  if (allActions.length === 0) return null

  return (
    <>
      <div className={clsx('flex items-center gap-1', className)}>
        {allActions.slice(0, 3).map((action, index) => {
          const Icon = action.icon
          const colorClasses = {
            blue: 'text-blue-600 hover:bg-blue-100',
            green: 'text-green-600 hover:bg-green-100',
            red: 'text-red-600 hover:bg-red-100',
            yellow: 'text-yellow-600 hover:bg-yellow-100',
            gray: 'text-gray-600 hover:bg-gray-100',
          }

          return (
            <Tooltip key={index} content={action.label}>
              <button
                onClick={action.onClick}
                className={clsx(
                  'p-1.5 rounded transition-colors',
                  colorClasses[action.color] || colorClasses.gray
                )}
                aria-label={action.label}
              >
                <Icon className="h-4 w-4" />
              </button>
            </Tooltip>
          )
        })}

        {/* More Actions Menu */}
        {allActions.length > 3 && (
          <div className="relative">
            <Tooltip content="More actions">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                aria-label="More actions"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </Tooltip>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {allActions.slice(3).map((action, index) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          action.onClick()
                          setShowMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{action.label}</span>
                      </button>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-sm text-gray-600 mb-6">{deleteMessage}</p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ActionButtons
