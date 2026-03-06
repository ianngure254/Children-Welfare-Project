/**
 * Generate admission number
 * @param {number} year - Academic year
 * @param {number} count - Current count of admissions
 * @returns {string} - Admission number (e.g., ADM20240001)
 */
export const generateAdmissionNumber = (year, count) => {
  const yearStr = year.toString();
  const countStr = String(count + 1).padStart(4, '0');
  return `ADM${yearStr}${countStr}`;
};

/**
 * Generate receipt number
 * @param {number} year - Year
 * @param {number} count - Current count of receipts
 * @returns {string} - Receipt number (e.g., RCP202400001)
 */
export const generateReceiptNumber = (year, count) => {
  const yearStr = year.toString();
  const countStr = String(count + 1).padStart(5, '0');
  return `RCP${yearStr}${countStr}`;
};

/**
 * Generate transaction reference
 * @param {string} prefix - Prefix for the reference
 * @param {number} count - Current count
 * @returns {string} - Transaction reference
 */
export const generateTransactionReference = (prefix = 'TXN', count) => {
  const timestamp = Date.now().toString().slice(-8);
  const countStr = String(count + 1).padStart(4, '0');
  return `${prefix}${timestamp}${countStr}`;
};

/**
 * Generate employee ID
 * @param {string} department - Department code
 * @param {number} count - Current count
 * @returns {string} - Employee ID
 */
export const generateEmployeeId = (department, count) => {
  const deptCode = department.substring(0, 3).toUpperCase();
  const countStr = String(count + 1).padStart(4, '0');
  const year = new Date().getFullYear().toString().slice(-2);
  return `${deptCode}${year}${countStr}`;
};

/**
 * Generate SKU for products
 * @param {string} category - Product category
 * @param {number} count - Current count
 * @returns {string} - SKU
 */
export const generateSKU = (category, count) => {
  const catCode = category.substring(0, 3).toUpperCase();
  const countStr = String(count + 1).padStart(5, '0');
  return `${catCode}-${countStr}`;
};
