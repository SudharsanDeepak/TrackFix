import { forwardRef } from 'react'
import { Check, Minus } from 'lucide-react'
import clsx from 'clsx'

const Checkbox = forwardRef(
  (
    { label, indeterminate = false, error, className = '', containerClassName = '', id, ...props },
    ref
  ) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={clsx('flex items-start', containerClassName)}>
        <div className="flex items-center h-11">
          <div className="relative">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className="sr-only peer"
              aria-invalid={error ? 'true' : 'false'}
              {...props}
            />
            <div
              className={clsx(
                'w-5 h-5 border-2 rounded transition-all duration-200',
                'flex items-center justify-center cursor-pointer',
                'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-ir-blue',
                'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
                {
                  'border-red-500': error,
                  'border-gray-300 peer-checked:bg-ir-blue peer-checked:border-ir-blue': !error,
                }
              )}
              onClick={() => {
                const input = document.getElementById(checkboxId)
                input?.click()
              }}
            >
              {indeterminate ? (
                <Minus className="w-3 h-3 text-white" />
              ) : (
                <Check className="w-3 h-3 text-white opacity-0 peer-checked:opacity-100" />
              )}
            </div>
          </div>
        </div>

        {label && (
          <label
            htmlFor={checkboxId}
            className="ml-3 text-sm text-gray-700 cursor-pointer select-none"
          >
            {label}
          </label>
        )}

        {error && (
          <p className="ml-8 mt-1 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export default Checkbox
