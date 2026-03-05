/**
 * Format date to readable string
 * @param {Date} date - Date object
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return null;
  
  const d = new Date(date);
  
  switch (format) {
    case 'long':
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return d.toISOString();
    case 'short':
    default:
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
  }
};

/**
 * Format date and time
 * @param {Date} date - Date object
 * @returns {string} - Formatted date and time string
 */
export const formatDateTime = (date) => {
  if (!date) return null;
  
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Calculate age from date of birth
 * @param {Date} dateOfBirth - Date of birth
 * @returns {number|null} - Age in years
 */
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get academic year from date
 * @param {Date} date - Date object
 * @returns {string} - Academic year (e.g., "2024-2025")
 */
export const getAcademicYear = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  
  // Assuming academic year starts in January
  if (month >= 0 && month < 6) {
    return `${year - 1}-${year}`;
  } else {
    return `${year}-${year + 1}`;
  }
};

/**
 * Get current term based on date
 * @param {Date} date - Date object
 * @returns {string} - Term ('term1', 'term2', 'term3')
 */
export const getCurrentTerm = (date = new Date()) => {
  const month = date.getMonth(); // 0-11
  
  if (month >= 0 && month < 4) {
    return 'term1'; // January - April
  } else if (month >= 4 && month < 8) {
    return 'term2'; // May - August
  } else {
    return 'term3'; // September - December
  }
};

/**
 * Check if date is in the past
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is in the past
 */
export const isPastDate = (date) => {
  if (!date) return false;
  return new Date(date) < new Date();
};

/**
 * Check if date is in the future
 * @param {Date} date - Date to check
 * @returns {boolean} - True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  return new Date(date) > new Date();
};

/**
 * Get date range for a period
 * @param {string} period - Period ('today', 'week', 'month', 'year')
 * @returns {Object} - Object with start and end dates
 */
export const getDateRange = (period = 'month') => {
  const today = new Date();
  const start = new Date();
  const end = new Date();
  
  switch (period) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(today.getDate() - 7);
      break;
    case 'month':
      start.setMonth(today.getMonth() - 1);
      break;
    case 'year':
      start.setFullYear(today.getFullYear() - 1);
      break;
    default:
      start.setMonth(today.getMonth() - 1);
  }
  
  return { start, end };
};
