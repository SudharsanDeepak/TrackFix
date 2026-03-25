/**
 * Validation utility functions
 */

/**
 * Validate email format
 */
export const isValidEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 * Minimum 8 characters
 */
export const isValidPassword = password => {
  return password && password.length >= 8
}

/**
 * Validate phone number (Indian format)
 */
export const isValidPhone = phone => {
  const phoneRegex = /^[6-9]\d{9}$/
  return phoneRegex.test(phone.replace(/\D/g, ''))
}

/**
 * Validate GST number format
 */
export const isValidGST = gst => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
  return gstRegex.test(gst)
}

/**
 * Validate PAN number format
 */
export const isValidPAN = pan => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  return panRegex.test(pan)
}

/**
 * Validate file size
 */
export const isValidFileSize = (file, maxSize) => {
  return file.size <= maxSize
}

/**
 * Validate file type
 */
export const isValidFileType = (file, allowedTypes) => {
  return allowedTypes.includes(file.type)
}

/**
 * Validate QR code format
 */
export const isValidQRCode = qrCode => {
  const qrRegex = /^IR-[A-Z]+-\d{4}-[A-Z0-9]+-\d{6}$/
  return qrRegex.test(qrCode)
}

/**
 * Validate number range
 */
export const isInRange = (value, min, max) => {
  const num = Number(value)
  return !isNaN(num) && num >= min && num <= max
}

/**
 * Validate required field
 */
export const isRequired = value => {
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  return value !== null && value !== undefined
}

/**
 * Get validation error message
 */
export const getValidationError = (field, value, rules) => {
  if (rules.required && !isRequired(value)) {
    return `${field} is required`
  }

  if (rules.email && !isValidEmail(value)) {
    return 'Invalid email format'
  }

  if (rules.password && !isValidPassword(value)) {
    return 'Password must be at least 8 characters'
  }

  if (rules.phone && !isValidPhone(value)) {
    return 'Invalid phone number'
  }

  if (rules.gst && !isValidGST(value)) {
    return 'Invalid GST number format'
  }

  if (rules.pan && !isValidPAN(value)) {
    return 'Invalid PAN number format'
  }

  if (rules.min && value.length < rules.min) {
    return `Minimum ${rules.min} characters required`
  }

  if (rules.max && value.length > rules.max) {
    return `Maximum ${rules.max} characters allowed`
  }

  if (rules.minValue && Number(value) < rules.minValue) {
    return `Minimum value is ${rules.minValue}`
  }

  if (rules.maxValue && Number(value) > rules.maxValue) {
    return `Maximum value is ${rules.maxValue}`
  }

  return null
}
