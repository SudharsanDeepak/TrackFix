import { forwardRef } from 'react'
import { Input, Select } from '../atoms'
import clsx from 'clsx'

const FormField = forwardRef(
  (
    {
      name,
      label,
      type = 'text',
      error,
      helpText,
      required = false,
      options,
      className = '',
      ...props
    },
    ref
  ) => {
    const fieldError = error?.message || error

    // If options are provided, render Select component
    if (options) {
      return (
        <Select
          ref={ref}
          label={label}
          options={options}
          error={fieldError}
          helpText={helpText}
          required={required}
          className={className}
          {...props}
        />
      )
    }

    // Otherwise render Input component
    return (
      <Input
        ref={ref}
        label={label}
        type={type}
        error={fieldError}
        helpText={helpText}
        required={required}
        className={className}
        {...props}
      />
    )
  }
)

FormField.displayName = 'FormField'

export default FormField
