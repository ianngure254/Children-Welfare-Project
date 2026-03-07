import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get file extension from filename
 * @param {string} filename - File name
 * @returns {string} - File extension
 */
export const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

/**
 * Validate file type
 * @param {string} filename - File name
 * @param {Array<string>} allowedTypes - Array of allowed file extensions
 * @returns {boolean} - True if file type is allowed
 */
export const isValidFileType = (filename, allowedTypes = ['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']) => {
  const extension = getFileExtension(filename);
  return allowedTypes.includes(extension);
};

/**
 * Validate file size
 * @param {number} size - File size in bytes
 * @param {number} maxSize - Maximum size in bytes (default: 5MB)
 * @returns {boolean} - True if file size is within limit
 */
export const isValidFileSize = (size, maxSize = 5 * 1024 * 1024) => {
  return size <= maxSize;
};

/**
 * Generate unique filename
 * @param {string} originalFilename - Original file name
 * @param {string} prefix - Prefix for the filename
 * @returns {string} - Unique filename
 */
export const generateUniqueFilename = (originalFilename, prefix = '') => {
  const extension = getFileExtension(originalFilename);
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const name = originalFilename.replace(extension, '').replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${prefix}${name}_${timestamp}_${random}${extension}`;
};

/**
 * Get MIME type from file extension
 * @param {string} filename - File name
 * @returns {string} - MIME type
 */
export const getMimeType = (filename) => {
  const extension = getFileExtension(filename);
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.txt': 'text/plain',
    '.csv': 'text/csv'
  };

  return mimeTypes[extension] || 'application/octet-stream';
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};
