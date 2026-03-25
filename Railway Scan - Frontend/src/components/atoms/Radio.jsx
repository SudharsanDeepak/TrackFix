import { forwardRef } from 'react'
import clsx from 'clsx'

const Radio = forwardRef(
  ({ label, error, className = '', containerClassName = '', id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`

    return (
      <div className={clsx('flex items-start', containerClassName)}>
        <div className="flex items-center h-11">
          <div className="relative">
            <input
              ref={ref}
              id={radioId}
              type="radio"
              className="sr-only peer"
              aria-invalid={error ? 'true' : 'false'}
              {...props}
            />
            <div
              className={clsx(
                'w-5 h-5 border-2 rounded-full transition-all duration-200',
                'flex items-center justify-center cursor-pointer',
                'peer-focus:ring-2 peer-focus:ring-offset-2 peer-focus:ring-ir-blue',
                'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed',
                {
                  'border-red-500': error,
                  'border-gray-300 peer-checked:border-ir-blue': !error,
                }
              )}
              onClick={() => {
                const input = document.getElementById(radioId)
                input?.click()
              }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-ir-blue opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
          </div>
        </div>

        {label && (
          <label
            htmlFor={radioId}
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

Radio.displayName = 'Radio'

// RadioGroup component for managing multiple radio buttons
export const RadioGroup = ({ children, name, value, onChange, className = '' }) => {
  return (
    <div className={clsx('space-y-2', className)} role="radiogroup">
      {children}
    </div>
  )
}

export default Radio
