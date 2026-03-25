import { forwardRef } from 'react'
import clsx from 'clsx'

const Input = forwardRef(
  (
    {
      label,
      type = 'text',
      error,
      helpText,
      className = '',
      containerClassName = '',
      id,
      required = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`

    const inputStyles = clsx(
      'w-full px-3 py-2.5 text-base border rounded-lg transition-colors duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-1',
      'disabled:bg-gray-100 disabled:cursor-not-allowed',
      {
        'border-red-500 focus:ring-red-500 focus:border-red-500': error,
        'border-gray-300 focus:ring-ir-blue focus:border-ir-blue': !error,
      },
      className
    )

    return (
      <div className={clsx('w-full', containerClassName)}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          className={inputStyles}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          {...props}
        />

        {error && (
          <p id={`${inputId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${inputId}-help`} className="mt-1.5 text-sm text-gray-500">
            {helpText}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
