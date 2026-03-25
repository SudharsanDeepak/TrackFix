import { useEffect, useRef } from 'react'

/**
 * ARIA Live Region Component
 * Announces dynamic content updates to screen readers
 *
 * @param {Object} props
 * @param {string} props.message - Message to announce
 * @param {string} props.politeness - 'polite' | 'assertive' | 'off'
 * @param {boolean} props.atomic - Whether to read entire region or just changes
 */
const LiveRegion = ({ message, politeness = 'polite', atomic = true }) => {
  const regionRef = useRef(null)

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear and re-set to trigger announcement
      regionRef.current.textContent = ''
      setTimeout(() => {
        if (regionRef.current) {
          regionRef.current.textContent = message
        }
      }, 100)
    }
  }, [message])

  return (
    <div
      ref={regionRef}
      role="status"
      aria-live={politeness}
      aria-atomic={atomic}
      className="sr-only"
    />
  )
}

export default LiveRegion
