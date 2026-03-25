import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input, Spinner } from '../atoms'
import clsx from 'clsx'

const SearchBar = ({
  placeholder = 'Search...',
  onSearch,
  debounceDelay = 500,
  loading = false,
  resultCount,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const debounceRef = useRef(null)

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm)
      }
    }, debounceDelay)

    // Cleanup on unmount
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [searchTerm, onSearch, debounceDelay])

  const handleClear = () => {
    setSearchTerm('')
    if (onSearch) {
      onSearch('')
    }
  }

  return (
    <div className={clsx('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder={placeholder}
          className={clsx(
            'w-full pl-10 pr-10 py-2.5 text-base border border-gray-300 rounded-lg',
            'focus:outline-none focus:ring-2 focus:ring-ir-blue focus:border-ir-blue',
            'transition-colors duration-200'
          )}
          aria-label="Search"
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
          {loading && <Spinner size="sm" />}

          {searchTerm && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {resultCount !== undefined && searchTerm && (
        <p className="mt-2 text-sm text-gray-600">
          {resultCount} {resultCount === 1 ? 'result' : 'results'} found
        </p>
      )}
    </div>
  )
}

export default SearchBar
