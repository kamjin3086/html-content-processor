/**
 * HTML Filter Strategy Library
 * 
 * A comprehensive library for cleaning, filtering, and converting HTML content
 * to Markdown with advanced customization options, presets, and plugin support.
 * 
 * @author HTML Filter Strategy Team
 * @license MIT
 */

// Version management
import { VERSION, API_VERSION, getVersionInfo } from './version';

// Core classes and components
export { HtmlProcessor } from './html-processor';
export { HtmlFilter } from './html-filter';
export { DefaultMarkdownGenerator } from './markdown-generator';

// DOM adapter for cross-environment compatibility
export { 
  domAdapter,
  parseHTML,
  getDOMParser,
  getDocument,
  isNode,
  isBrowser 
} from './dom-adapter';

// Type definitions
export {
  ProcessorOptions,
  FilterOptions,
  ConverterOptions,
  ConvertOptions,
  FilterResult,
  MarkdownResult,
  FilterMetadata,
  MarkdownMetadata,
  Plugin,
  PluginContext,
  PresetName,
  ProcessorError,
  FilterError,
  ConversionError,
  PluginError,
  MarkdownGenerationResult,
  Html2TextOptions
} from './types';

// Page type detection
export {
  PageTypeDetector,
  pageTypeDetector,
  PageTypeResult,
  PageType,
  PageCharacteristics
} from './page-type-detector';

// Convenience functions - Main API
export {
  htmlToMarkdown,
  htmlToMarkdownWithCitations,
  htmlToText,
  cleanHtml,
  extractContent,
  htmlToArticleMarkdown,
  htmlToBlogMarkdown,
  htmlToNewsMarkdown,
  strictCleanHtml,
  gentleCleanHtml,
  createProcessor,
  htmlToMarkdownAuto,
  cleanHtmlAuto,
  extractContentAuto
} from './convenience-api';

// Presets management
export {
  presets,
  getPreset,
  getPresetNames,
  hasPreset,
  mergeWithPreset
} from './presets';

// Plugin system
export {
  usePlugin,
  removePlugin,
  getPlugin,
  hasPlugin,
  getAllPlugins,
  getPluginNames,
  clearPlugins,
  getPluginStats,
  builtinPlugins,
  useBuiltinPlugins
} from './plugin-manager';

// Export version management
export { VERSION, API_VERSION, getVersionInfo };

// Import core classes for default export
import { HtmlProcessor } from './html-processor';
import {
  htmlToMarkdown,
  htmlToMarkdownWithCitations,
  htmlToText,
  cleanHtml,
  extractContent,
  createProcessor
} from './convenience-api';

/**
 * Main API object - Clean and simple interface
 */
const htmlFilterAPI = {
  // Main processor class
  HtmlProcessor,
  
  // Core convenience functions
  htmlToMarkdown,
  htmlToMarkdownWithCitations,
  htmlToText,
  cleanHtml,
  extractContent,
  createProcessor,
  
  // Version information
  version: VERSION,
  apiVersion: API_VERSION,
  getVersionInfo
};

// Minimal browser global registration (only if needed)
if (typeof window !== 'undefined') {
  (window as any).htmlFilter = htmlFilterAPI;
  console.log(`[HTMLFilter] Library loaded - Version: ${VERSION}`);
}

// Default export - Clean and simple
export default htmlFilterAPI; 