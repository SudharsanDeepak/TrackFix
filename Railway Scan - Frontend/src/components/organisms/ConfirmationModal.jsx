import { useEffect, useRef } from 'react'
import { X, AlertTriangle } from 'lucide-react'
import { Button } from '../atoms'
import clsx from 'clsx'

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // danger, warning, info
  itemCount = null,
  loading = false,
}) => {
  const modalRef = useRef(null)
  const firstFocusableRef = useRef(null)
  const lastFocusableRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return

    // Lock body scroll
    document.body.style.overflow = 'hidden'

    // Focus first element
    firstFocusableRef.current?.focus()

    // Handle Escape key
    const handleEscape = e => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    // Focus trap
    const handleTab = e => {
      if (e.key !== 'Tab') return

      if (e.shiftKey) {
        if (document.activeElement === firstFocusableRef.current) {
          e.preventDefault()
          lastFocusableRef.current?.focus()
        }
      } else {
        if (document.activeElement === lastFocusableRef.current) {
          e.preventDefault()
          firstFocusableRef.current?.focus()
        }
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.addEventListener('keydown', handleTab)

    return () => {
      document.body.style.overflow = 'unset'
      document.removeEventListener('keydown', handleEscape)
      document.removeEventListener('keydown', handleTab)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100',
      button: 'bg-red-600 hover:bg-red-700',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
      button: 'bg-yellow-600 hover:bg-yellow-700',
    },
    info: {
      icon: AlertTriangle,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100',
      button: 'bg-blue-600 hover:bg-blue-700',
    },
  }

  const style = variantStyles[variant] || variantStyles.danger
  const Icon = style.icon

  const handleConfirm = () => {
    onConfirm()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl max-w-md w-full"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4">
          <div className="flex items-start gap-4">
            <div className={clsx('flex-shrink-0 p-2 rounded-full', style.iconBg)}>
              <Icon className={clsx('h-6 w-6', style.iconColor)} />
            </div>
            <div>
              <h3 id="modal-title" className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          <p className="text-sm text-gray-600 ml-14">{message}</p>
          {itemCount !== null && (
            <p className="text-sm font-medium text-gray-900 mt-2 ml-14">
              This will affect {itemCount} item{itemCount !== 1 ? 's' : ''}.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg">
          <Button ref={firstFocusableRef} variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <button
            ref={lastFocusableRef}
            onClick={handleConfirm}
            disabled={loading}
            className={clsx(
              'px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              style.button
            )}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
