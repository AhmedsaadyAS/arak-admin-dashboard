/**
 * ID Validation and Type Safety Utilities
 * Ensures consistent ID handling across the application
 * Prevents String vs Number mismatch errors in JSON Server
 */

/**
 * Normalize any ID value to a number or null
 * @param {*} id - ID value (string, number, or other)
 * @returns {number|null} Normalized numeric ID or null if invalid
 */
export const normalizeId = (id) => {
    if (id === null || id === undefined || id === '') return null;

    const numId = Number(id);
    return isNaN(numId) ? null : numId;
};

/**
 * Ensure ID is a valid number, throw if invalid
 * @param {*} id - ID value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {number} Valid numeric ID
 * @throws {Error} If ID is invalid
 */
export const ensureNumericId = (id, fieldName = 'id') => {
    const normalized = normalizeId(id);
    if (normalized === null) {
        throw new Error(`Invalid ${fieldName}: must be a valid number (got ${typeof id}: ${id})`);
    }
    return normalized;
};

/**
 * Validate array of IDs, returning only valid numeric IDs
 * @param {Array} ids - Array of ID values
 * @param {boolean} throwOnInvalid - Throw error if any ID is invalid
 * @returns {Array<number>} Array of valid numeric IDs
 */
export const normalizeIdArray = (ids, throwOnInvalid = false) => {
    if (!Array.isArray(ids)) {
        if (throwOnInvalid) {
            throw new Error('Expected array of IDs');
        }
        return [];
    }

    const normalized = ids
        .map(id => normalizeId(id))
        .filter(id => id !== null);

    if (throwOnInvalid && normalized.length !== ids.length) {
        throw new Error('One or more invalid IDs in array');
    }

    return normalized;
};

/**
 * Check if two IDs are equal (handles string/number comparison)
 * @param {*} id1 - First ID
 * @param {*} id2 - Second ID
 * @returns {boolean} True if IDs are equal
 */
export const idsEqual = (id1, id2) => {
    const norm1 = normalizeId(id1);
    const norm2 = normalizeId(id2);

    if (norm1 === null || norm2 === null) return false;
    return norm1 === norm2;
};

/**
 * Normalize an object's ID fields
 * @param {Object} obj - Object containing ID fields
 * @param {Array<string>} idFields - Field names to normalize (default: ['id'])
 * @returns {Object} Object with normalized IDs
 */
export const normalizeObjectIds = (obj, idFields = ['id']) => {
    if (!obj || typeof obj !== 'object') return obj;

    const normalized = { ...obj };

    idFields.forEach(field => {
        if (field in normalized) {
            normalized[field] = normalizeId(normalized[field]);
        }
    });

    return normalized;
};

/**
 * Validate and normalize request data before API calls
 * Useful for forms and mutations
 * @param {Object} data - Request data
 * @param {Array<string>} requiredIds - Required ID fields
 * @param {Array<string>} optionalIds - Optional ID fields
 * @returns {Object} Normalized data
 */
export const validateRequestIds = (data, requiredIds = [], optionalIds = []) => {
    const normalized = { ...data };

    // Validate required IDs
    requiredIds.forEach(field => {
        if (!(field in normalized)) {
            throw new Error(`Missing required field: ${field}`);
        }
        normalized[field] = ensureNumericId(normalized[field], field);
    });

    // Normalize optional IDs
    optionalIds.forEach(field => {
        if (field in normalized && normalized[field] !== null && normalized[field] !== undefined) {
            normalized[field] = normalizeId(normalized[field]);
        }
    });

    return normalized;
};

/**
 * Create a safe ID comparator for array operations
 * Usage: array.includes(id) becomes array.some(safeIdMatch(id))
 * @param {*} targetId - ID to match
 * @returns {Function} Comparator function
 */
export const safeIdMatch = (targetId) => {
    const normalizedTarget = normalizeId(targetId);
    return (id) => idsEqual(id, normalizedTarget);
};

/**
 * Batch normalize IDs in an array of objects
 * @param {Array<Object>} objects - Array of objects
 * @param {Array<string>} idFields - ID fields to normalize
 * @returns {Array<Object>} Normalized objects
 */
export const normalizeObjectArrayIds = (objects, idFields = ['id']) => {
    if (!Array.isArray(objects)) return objects;
    return objects.map(obj => normalizeObjectIds(obj, idFields));
};

// Export all utilities as default object for convenience
export default {
    normalizeId,
    ensureNumericId,
    normalizeIdArray,
    idsEqual,
    normalizeObjectIds,
    validateRequestIds,
    safeIdMatch,
    normalizeObjectArrayIds
};
