/**
 * Version management module
 * 
 * This module exports the current version from package.json
 * to ensure version consistency across the codebase.
 */

// Import package.json to get the version
// Use require for better compatibility with build tools
const packageJson = require('../package.json');

/**
 * Current library version from package.json
 */
export const VERSION: string = packageJson.version;

/**
 * API version for compatibility tracking
 */
export const API_VERSION = 'v1';

/**
 * Get version information
 */
export function getVersionInfo() {
  return {
    version: VERSION,
    apiVersion: API_VERSION,
    name: packageJson.name,
    description: packageJson.description
  };
}

/**
 * Legacy version constant for backward compatibility
 * @deprecated Use VERSION instead
 */
export const version = VERSION; 