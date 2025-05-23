/**
 * HTML Filter Strategy Library
 * 
 * A comprehensive library for cleaning, filtering, and converting HTML content
 * to Markdown with advanced customization options, presets, and plugin support.
 * 
 * @version 1.0.0
 * @author HTML Filter Strategy Team
 * @license MIT
 */

// Core classes and components
export { HtmlProcessor } from './html-processor';
export { HtmlFilter } from './html-filter';
export { DefaultMarkdownGenerator } from './markdown-generator';

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
  // Legacy types for backward compatibility
  MarkdownGenerationResult,
  Html2TextOptions
} from './types';

// Convenience functions
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
  createProcessor
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

// Import everything for the default export
import { HtmlProcessor } from './html-processor';
import { HtmlFilter } from './html-filter';
import { DefaultMarkdownGenerator, MarkdownGeneratorOptions } from './markdown-generator';
import { MarkdownGenerationResult } from './types';
import {
  htmlToMarkdown as newHtmlToMarkdown,
  htmlToMarkdownWithCitations as newHtmlToMarkdownWithCitations,
  htmlToText,
  cleanHtml,
  extractContent,
  htmlToArticleMarkdown,
  htmlToBlogMarkdown,
  htmlToNewsMarkdown,
  strictCleanHtml,
  gentleCleanHtml,
  createProcessor
} from './convenience-api';
import { presets, getPreset } from './presets';
import {
  usePlugin,
  removePlugin,
  getAllPlugins,
  useBuiltinPlugins
} from './plugin-manager';

// Legacy filter instance for backward compatibility
const legacyFilter = new HtmlFilter(2, 'dynamic', 0.48);

/**
 * @deprecated Use HtmlProcessor.from(html).filter().toArray() instead
 * Legacy function: Filters HTML content and returns the result as an array
 * @param html Input HTML string
 * @returns Array of filtered HTML fragments
 */
function filterHtmlToArray(html: string): string[] {
  try {
    if (!html) {
      console.log('[HTMLFilter] Input is empty, returning empty array');
      return [];
    }
    
    const result = legacyFilter.filterContent(html);
    
    if (!result || result.length === 0) {
      console.log('[HTMLFilter] No content after filtering, returning original HTML');
      return [html];
    }
    
    console.log(`[HTMLFilter] Filtering successful, ${result.length} fragments obtained`);
    return result;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('HTML filtering failed:', errorMessage);
    return html ? [html] : [];
  }
}

/**
 * @deprecated Use HtmlProcessor.from(html).filter().toString() instead
 * Legacy function: Filters HTML content and returns a single string result
 * @param html Input HTML string
 * @returns Concatenated HTML string after filtering
 */
function filterHtmlToString(html: string): string {
  try {
    if (!html) {
      console.log('[HTMLFilter] Input is empty, returning empty string');
      return '';
    }
    
    const filteredHtml = legacyFilter.filterContentAsString(html);
    
    if (!filteredHtml) {
      console.log('[HTMLFilter] No content after filtering, returning original HTML');
      return html;
    }
    
    console.log(`[HTMLFilter] Filtering successful, string result length: ${filteredHtml.length}`);
    return filteredHtml;
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('HTML filtering failed:', errorMessage);
    return html || '';
  }
}

/**
 * @deprecated Use HtmlProcessor.from(html).withBaseUrl(baseUrl).toMarkdown() instead
 * Legacy function: Converts HTML to Markdown
 * @param html Input HTML string
 * @param options Markdown generation options
 * @param baseUrl Base URL for resolving relative links
 * @param citations Whether to include citations
 * @returns Markdown generation result object
 */
function legacyHtmlToMarkdown(
  html: string, 
  options?: MarkdownGeneratorOptions, 
  baseUrl: string = '',
  citations: boolean = true
): MarkdownGenerationResult {
  if (!html) {
    console.log('[HTMLFilter] Input is empty for Markdown conversion');
    return {
      rawMarkdown: '',
      markdownWithCitations: '',
      referencesMarkdown: '',
      fitMarkdown: '',
      fitHtml: ''
    };
  }
  
  const mdGenerator = new DefaultMarkdownGenerator(legacyFilter, options);
  const result = mdGenerator.generateMarkdown(html, baseUrl, options, null, citations);
  console.log('[HTMLFilter] Markdown conversion complete');
  return result;
}

/**
 * @deprecated Use htmlToMarkdownWithCitations() instead
 * Legacy function: Converts HTML to Markdown with citations
 * @param html Input HTML string
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown text with citations
 */
function legacyHtmlToMarkdownWithCitations(html: string, baseUrl: string = ''): string {
  const result = legacyHtmlToMarkdown(html, undefined, baseUrl, true);
  return result.markdownWithCitations + result.referencesMarkdown;
}

/**
 * @deprecated Use htmlToText() instead
 * Legacy function: Converts HTML to plain text Markdown
 * @param html Input HTML string
 * @returns Converted Markdown text
 */
function htmlToPlainMarkdown(html: string): string {
  const result = legacyHtmlToMarkdown(html, { ignoreLinks: true, ignoreImages: true });
  return result.rawMarkdown;
}

/**
 * @deprecated Use htmlToMarkdown() instead
 * Legacy function: Converts HTML to concise Markdown (fitMarkdown)
 * @param html Input HTML string
 * @returns Concise Markdown text
 */
function htmlToFitMarkdown(html: string): string {
  const result = legacyHtmlToMarkdown(html);
  return result.fitMarkdown || result.rawMarkdown;
}

/**
 * @deprecated Use HtmlProcessor debug methods instead
 * Legacy debug function: Compares HTML before and after filtering
 * @param html Original HTML
 * @returns Object containing original and filtered HTML, and stats
 */
function debugFilterComparison(html: string) {
  if (!html) return { original: '', filtered: '', success: false };
  
  try {
    const filtered = filterHtmlToString(html);
    const originalLength = html.length;
    const filteredLength = filtered.length;
    const reductionPercent = originalLength > 0 ? Math.round((1 - filteredLength / originalLength) * 100) : 0;

    return {
      original: html,
      filtered: filtered,
      success: true,
      originalLength: originalLength,
      filteredLength: filteredLength,
      reductionPercent: reductionPercent
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Debug comparison failed:', errorMessage);
    return {
      original: html,
      filtered: '',
      success: false,
      error: errorMessage
    };
  }
}

// Legacy API object for backward compatibility
const legacyAPI = {
  // Legacy classes
  HtmlFilter,
  DefaultMarkdownGenerator,
  
  // Legacy main functions
  filterHtmlToArray,
  filterHtmlToString,
  htmlToMarkdown: legacyHtmlToMarkdown,
  htmlToMarkdownWithCitations: legacyHtmlToMarkdownWithCitations,
  htmlToPlainMarkdown,
  htmlToFitMarkdown,
  
  // Legacy aliases
  toArray: filterHtmlToArray,
  toString: filterHtmlToString,
  toMarkdown: legacyHtmlToMarkdown,
  toMarkdownWithRefs: legacyHtmlToMarkdownWithCitations,
  toPlainMarkdown: htmlToPlainMarkdown,
  toFitMarkdown: htmlToFitMarkdown,
  
  // Debug function
  debugFilterComparison,
  
  // Internal API (pre-configured filter instance)
  filter: legacyFilter, 
  
  // Version information
  version: '1.0.0'
};

// Export legacy functions for backward compatibility
export {
  filterHtmlToArray,
  filterHtmlToString,
  legacyHtmlToMarkdown as htmlToMarkdownLegacy,
  legacyHtmlToMarkdownWithCitations as htmlToMarkdownWithCitationsLegacy,
  htmlToPlainMarkdown,
  htmlToFitMarkdown,
  debugFilterComparison
};

// Default export: New API with backward compatibility
const htmlFilterAPI = {
  // New API - Main processor class
  HtmlProcessor,
  
  // New API - Convenience functions
  htmlToMarkdown: newHtmlToMarkdown,
  htmlToMarkdownWithCitations: newHtmlToMarkdownWithCitations,
  htmlToText,
  cleanHtml,
  extractContent,
  createProcessor,
  
  // New API - Preset functions
  htmlToArticleMarkdown,
  htmlToBlogMarkdown,
  htmlToNewsMarkdown,
  strictCleanHtml,
  gentleCleanHtml,
  
  // New API - Plugin system
  usePlugin,
  removePlugin,
  getAllPlugins,
  useBuiltinPlugins,
  
  // New API - Presets
  presets,
  getPreset,
  
  // Legacy API classes
  HtmlFilter,
  DefaultMarkdownGenerator,
  
  // Legacy functions with legacy prefix to avoid conflicts
  filterHtmlToArray,
  filterHtmlToString,
  htmlToPlainMarkdown,
  htmlToFitMarkdown,
  debugFilterComparison,
  
  // Legacy aliases
  toArray: filterHtmlToArray,
  toString: filterHtmlToString,
  toMarkdown: legacyHtmlToMarkdown,
  toMarkdownWithRefs: legacyHtmlToMarkdownWithCitations,
  toPlainMarkdown: htmlToPlainMarkdown,
  toFitMarkdown: htmlToFitMarkdown,
  
  // Internal API (pre-configured filter instance)
  filter: legacyFilter, 
  
  // Legacy API namespace for explicit legacy access
  legacy: legacyAPI,
  
  // Version and metadata
  version: '1.0.0',
  apiVersion: 'v1'
};

// Browser global registration
if (typeof window !== 'undefined') {
  (window as any).htmlFilter = htmlFilterAPI;
  (window as any).HtmlProcessor = HtmlProcessor;

  console.log(`[HTMLFilter] Library loaded successfully - Version: ${htmlFilterAPI.version}`);
  console.log('[HTMLFilter] New API: Use HtmlProcessor class or convenience functions');
  console.log('[HTMLFilter] Legacy API: Available for backward compatibility');
  
  // Helper function for browser console testing
  (window as any).testHtmlFilter = function(html: string, preset?: string) {
    if (preset) {
      return createProcessor({ preset: preset as any }).filter().toMarkdown();
    }
    return newHtmlToMarkdown(html);
  };
}

// Default export
export default htmlFilterAPI; 