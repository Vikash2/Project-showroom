/**
 * Shared utility helpers for the Vehicle Showroom Backend
 */

/**
 * Format a Supabase database row to camelCase API response
 * @param {Object} row - Database row with snake_case keys
 * @param {Object} mapping - Key mapping { dbKey: apiKey }
 * @returns {Object} Formatted object with camelCase keys
 */
function formatResponse(row, mapping) {
  const result = {};
  for (const [dbKey, apiKey] of Object.entries(mapping)) {
    if (row[dbKey] !== undefined) {
      result[apiKey] = row[dbKey];
    }
  }
  return result;
}

/**
 * Generate a human-readable ID with prefix
 * @param {string} prefix - e.g., "BK", "INQ", "SL"
 * @param {number} counter - Sequential number
 * @returns {string} e.g., "BK-00001"
 */
function generateReadableId(prefix, counter) {
  return `${prefix}-${String(counter).padStart(5, "0")}`;
}

/**
 * Get current ISO timestamp
 * @returns {string} ISO date string
 */
function now() {
  return new Date().toISOString();
}

/**
 * Paginate query results
 * @param {Object} query - Supabase query builder
 * @param {number} page - Page number (1-indexed)
 * @param {number} pageSize - Items per page
 * @returns {Object} Query with range applied
 */
function paginate(query, page = 1, pageSize = 25) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  return query.range(from, to);
}

/**
 * Build a standard API success response
 * @param {string} message 
 * @param {Object} data 
 * @returns {Object}
 */
function successResponse(message, data = {}) {
  return { success: true, message, ...data };
}

/**
 * Build a standard API error response
 * @param {string} message 
 * @param {string} code 
 * @param {number} statusCode 
 * @returns {Error}
 */
function apiError(message, code = "UNKNOWN_ERROR", statusCode = 500) {
  const error = new Error(message);
  error.code = code;
  error.statusCode = statusCode;
  return error;
}

module.exports = {
  formatResponse,
  generateReadableId,
  now,
  paginate,
  successResponse,
  apiError,
};
