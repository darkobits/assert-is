/**
 * List of "is" methods we never support.
 *
 * @type {array}
 */
export const ALWAYS_UNSUPPORTED = ['all', 'any'];


/**
 * List of "is" methods we don't support when performing union type checks.
 *
 * @type {array}
 */
export const UNSUPPORTED_WHEN_UNION = ['inRange', 'directInstanceOf'];


/**
 * Placeholder for labels used in error messages.
 *
 * @type {string}
 */
export const LABEL_PLACEHOLDER = '%LABEL%';
