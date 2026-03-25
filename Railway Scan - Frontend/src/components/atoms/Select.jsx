import { forwardRef, useState } from 'react'
import { ChevronDown, Search } from 'lucide-react'
import clsx from 'clsx'

const Select = forwardRef(
  (
    {
      label,
      options = [],
      error,
      helpText,
      className = '',
      containerClassName = '',
      id,
      required = false,
      searchable = false,
      placeholder = 'Select an option',
      onChange,
      value,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const selectId = id || `select-${Math.random().toString(36).substring(2, 11)}`

    const filteredOptions = searchable
      ? options.filter(option => option.label.toLowerCase().includes(searchTerm.toLowerCase()))
      : options

    const selectedOption = options.find(opt => opt.value === value)

    const handleSelect = option => {
      if (onChange) {
        // Support both direct onChange and React Hook Form
        const event = {
          target: {
            name: props.name || selectId,
            value: option.value,
          },
        }
        onChange(event)
      }
      setIsOpen(false)
      setSearchTerm('')
    }

    const handleKeyDown = e => {
      if (e.key === 'Escape') {
        setIsOpen(false)
      } else if (e.key === 'Enter' && filteredOptions.length > 0) {
        handleSelect(filteredOptions[0])
      }
    }

    return (
      <div className={clsx('w-full relative', containerClassName)}>
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          <button
            ref={ref}
            id={selectId}
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={clsx(
              'w-full px-3 py-2.5 text-base border rounded-lg transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-1',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              'flex items-center justify-between',
              {
                'border-red-500 focus:ring-red-500': error,
                'border-gray-300 focus:ring-ir-blue': !error,
              },
              className
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-invalid={error ? 'true' : 'false'}
            {...props}
          >
            <span className={clsx(!selectedOption && 'text-gray-400')}>
              {selectedOption?.label || placeholder}
            </span>
            <ChevronDown
              className={clsx(
                'h-5 w-5 text-gray-400 transition-transform',
                isOpen && 'transform rotate-180'
              )}
            />
          </button>

          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-hidden">
              {searchable && (
                <div className="p-2 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-ir-blue"
                      autoFocus
                    />
                  </div>
                </div>
              )}

              <ul role="listbox" className="overflow-y-auto max-h-48" aria-labelledby={selectId}>
                {filteredOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-gray-500 text-center">No options found</li>
                ) : (
                  filteredOptions.map(option => (
                    <li
                      key={option.value}
                      role="option"
                      aria-selected={option.value === value}
                      onClick={() => handleSelect(option)}
                      className={clsx(
                        'px-3 py-2 cursor-pointer transition-colors',
                        'hover:bg-gray-100',
                        option.value === value && 'bg-ir-blue/10 text-ir-blue font-medium'
                      )}
                    >
                      {option.label}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p id={`${selectId}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {helpText && !error && (
          <p id={`${selectId}-help`} className="mt-1.5 text-sm text-gray-500">
            {helpText}
          </p>
        )}

        {isOpen && (
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
