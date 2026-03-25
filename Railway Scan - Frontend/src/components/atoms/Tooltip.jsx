import { useState, useRef, useEffect } from 'react'
import clsx from 'clsx'

const Tooltip = ({ children, content, position = 'top', delay = 200, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const timeoutRef = useRef(null)
  const tooltipRef = useRef(null)

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window)
  }, [])

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true)
    }, delay)
  }

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsVisible(false)
  }

  const handleTouchStart = () => {
    if (isTouchDevice) {
      setIsVisible(!isVisible)
    }
  }

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const arrows = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-gray-900',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-gray-900',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-gray-900',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-gray-900',
  }

  if (!content) return children

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        onTouchStart={handleTouchStart}
        className="inline-block"
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={clsx(
            'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg',
            'whitespace-nowrap pointer-events-none',
            'animate-in fade-in duration-200',
            positions[position],
            className
          )}
          aria-hidden={!isVisible}
        >
          {content}
          <div className={clsx('absolute w-0 h-0 border-4 border-transparent', arrows[position])} />
        </div>
      )}
    </div>
  )
}

export default Tooltip
