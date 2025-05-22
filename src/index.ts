import { HtmlFilter } from './html-filter';
import { DefaultMarkdownGenerator, MarkdownGeneratorOptions } from './markdown-generator';
import { Html2TextOptions, MarkdownGenerationResult } from './types';

/**
 * Example: How to use the HtmlFilter class to filter HTML content
 */

// Create an HtmlFilter instance with a more lenient configuration
// Lower threshold, reduce minimum word count requirement, use dynamic threshold
// Modified to use configuration parameters based on the Python version
const filter = new HtmlFilter(2, 'dynamic', 0.48);

// Logging function for debugging
function logDebug(message: string, data?: any) {
  if (typeof console !== 'undefined') {
    if (data) {
      console.log(`[HTMLFilter] ${message}`, data);
    } else {
      console.log(`[HTMLFilter] ${message}`);
    }
  }
}

/**
 * Example function: Filters HTML content and returns the result as an array.
 * @param html Input HTML string
 * @returns Array of filtered HTML fragments
 */
function filterHtmlToArray(html: string): string[] {
  try {
    if (!html) {
      logDebug('Input is empty, returning empty array');
      return [];
    }
    
    const result = filter.filterContent(html);
    
    if (!result || result.length === 0) {
      logDebug('No content after filtering, returning original HTML');
      return [html]; // Return original HTML in an array if filtering results in nothing
    }
    
    logDebug(`Filtering successful, ${result.length} fragments obtained`);
    return result;
  } catch (error) {
    console.error('HTML filtering failed:', error);
    return html ? [html] : []; // Return original HTML in an array on error
  }
}

/**
 * Example function: Filters HTML content and returns a single string result.
 * @param html Input HTML string
 * @returns Concatenated HTML string after filtering
 */
function filterHtmlToString(html: string): string {
  try {
    if (!html) {
      logDebug('Input is empty, returning empty string');
      return '';
    }
    
    const filteredHtml = filter.filterContentAsString(html);
    
    if (!filteredHtml) {
      logDebug('No content after filtering, returning original HTML');
      return html; // Return original HTML if filtering results in nothing
    }
    
    logDebug(`Filtering successful, string result length: ${filteredHtml.length}`);
    return filteredHtml;
  } catch (error) {
    console.error('HTML filtering failed:', error);
    return html || ''; // Return original HTML on error
  }
}

/**
 * Example function: Converts HTML to Markdown.
 * @param html Input HTML string
 * @param options Markdown generation options
 * @param baseUrl Base URL for resolving relative links
 * @param citations Whether to include citations
 * @returns Markdown generation result object
 */
function htmlToMarkdown(
  html: string, 
  options?: MarkdownGeneratorOptions, 
  baseUrl: string = '',
  citations: boolean = true
): MarkdownGenerationResult {
  if (!html) {
    logDebug('Input is empty for Markdown conversion');
    return {
      rawMarkdown: '',
      markdownWithCitations: '',
      referencesMarkdown: '',
      fitMarkdown: '',
      fitHtml: ''
    };
  }
  
  const mdGenerator = new DefaultMarkdownGenerator(filter, options);
  const result = mdGenerator.generateMarkdown(html, baseUrl, options, null, citations);
  logDebug('Markdown conversion complete');
  return result;
}

/**
 * Example function: Converts HTML to Markdown with citations.
 * @param html Input HTML string
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown text with citations
 */
function htmlToMarkdownWithCitations(html: string, baseUrl: string = ''): string {
  const result = htmlToMarkdown(html, undefined, baseUrl, true);
  return result.markdownWithCitations + result.referencesMarkdown;
}

/**
 * Example function: Converts HTML to plain text Markdown.
 * @param html Input HTML string
 * @returns Converted Markdown text
 */
function htmlToPlainMarkdown(html: string): string {
  const result = htmlToMarkdown(html, { ignoreLinks: true, ignoreImages: true });
  return result.rawMarkdown;
}

/**
 * Example function: Converts HTML to concise Markdown (fitMarkdown).
 * @param html Input HTML string
 * @returns Concise Markdown text
 */
function htmlToFitMarkdown(html: string): string {
  const result = htmlToMarkdown(html);
  return result.fitMarkdown || result.rawMarkdown; // Fallback to rawMarkdown if fitMarkdown is empty
}

/**
 * Debug function: Compares HTML before and after filtering.
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
  } catch (error: any) {
    console.error('Debug comparison failed:', error);
    return {
      original: html,
      filtered: '',
      success: false,
      error: error.message
    };
  }
}

// API object creation
const htmlFilterAPI = {
  // Classes
  HtmlFilter,
  DefaultMarkdownGenerator,
  
  // Main functions
  filterHtmlToArray,
  filterHtmlToString,
  htmlToMarkdown,
  htmlToMarkdownWithCitations,
  htmlToPlainMarkdown,
  htmlToFitMarkdown,
  
  // Aliases for convenience
  toArray: filterHtmlToArray,
  toString: filterHtmlToString,
  toMarkdown: htmlToMarkdown,
  toMarkdownWithRefs: htmlToMarkdownWithCitations,
  toPlainMarkdown: htmlToPlainMarkdown,
  toFitMarkdown: htmlToFitMarkdown,
  
  // Debug function
  debugFilterComparison,
  
  // Internal API (pre-configured filter instance for direct use)
  filter, 
  
  // Version information
  version: '0.0.1'
};

// Export functions for use in other modules
export {
  HtmlFilter,
  DefaultMarkdownGenerator,
  filterHtmlToArray,
  filterHtmlToString,
  htmlToMarkdown,
  htmlToMarkdownWithCitations,
  htmlToPlainMarkdown,
  htmlToFitMarkdown,
  debugFilterComparison
};

// Default export for all APIs
export default htmlFilterAPI;

// Example: If this file is run directly (e.g., in a browser context)
if (typeof window !== 'undefined') {
  // Add a global function for easy testing in the browser console
  (window as any).htmlFilter = htmlFilterAPI;

  logDebug('HTMLFilter loaded, version: ' + htmlFilterAPI.version);
  
  // Add a helper function to call API methods by name
  (window as any).callHtmlFilter = function(methodName: string, ...args: any[]) {
    if (methodName in htmlFilterAPI && typeof (htmlFilterAPI as any)[methodName] === 'function') {
      return (htmlFilterAPI as any)[methodName](...args);
    } else {
      console.error(`Method ${methodName} does not exist or is not a function`);
      return null;
    }
  };
} 