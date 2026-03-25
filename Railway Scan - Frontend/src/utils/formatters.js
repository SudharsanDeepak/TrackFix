import { format, formatDistanceToNow, parseISO } from 'date-fns'

/**
 * Format date to readable string
 */
export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return format(dateObj, formatStr)
  } catch (error) {
    return '-'
  }
}

/**
 * Format date and time
 */
export const formatDateTime = date => {
  return formatDate(date, 'dd MMM yyyy, HH:mm')
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = date => {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    return formatDistanceToNow(dateObj, { addSuffix: true })
  } catch (error) {
    return '-'
  }
}

/**
 * Format number with Indian locale
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) return '-'
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number)
}

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = amount => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format percentage
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined) return '-'
  return `${formatNumber(value, decimals)}%`
}

/**
 * Format file size
 */
export const formatFileSize = bytes => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format phone number (Indian format)
 */
export const formatPhone = phone => {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`
  }
  return phone
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Capitalize first letter
 */
export const capitalize = text => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

/**
 * Format status badge text
 */
export const formatStatus = status => {
  if (!status) return ''
  return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}
