/**
 * Configuration options for HTML processing
 */
export interface ProcessorOptions {
  /** Filter configuration options */
  filter?: FilterOptions;
  /** Markdown converter configuration options */
  converter?: ConverterOptions;
  /** Base URL for resolving relative links */
  baseUrl?: string;
  /** Preset configuration name */
  preset?: PresetName;
  /** Enable automatic page type detection */
  autoDetect?: boolean;
  /** Debug mode for additional logging */
  debug?: boolean;
}

/**
 * Available preset configuration names
 */
export type PresetName = 'article' | 'blog' | 'news' | 'strict' | 'loose' | 'default';

/**
 * HTML filtering configuration options
 */
export interface FilterOptions {
  /** Content threshold for filtering (default: 2) */
  threshold?: number;
  /** Filtering strategy (default: 'dynamic') */
  strategy?: 'fixed' | 'dynamic';
  /** Content ratio threshold (default: 0.48) */
  ratio?: number;
  /** Minimum word count requirement (default: 0) */
  minWords?: number;
  /** Whether to preserve HTML structure during filtering */
  preserveStructure?: boolean;
  /** HTML elements to remove completely */
  removeElements?: string[];
  /** HTML elements to keep (whitelist) */
  keepElements?: string[];
}

/**
 * Markdown conversion configuration options
 */
export interface ConverterOptions {
  /** Whether to include link citations (default: true) */
  citations?: boolean;
  /** Whether to ignore links during conversion */
  ignoreLinks?: boolean;
  /** Whether to ignore images during conversion */
  ignoreImages?: boolean;
  /** Markdown format style */
  format?: 'github' | 'commonmark' | 'custom';
  /** Link reference style */
  linkStyle?: 'inline' | 'reference';
  /** Whether to escape special Markdown characters */
  escapeSpecialChars?: boolean;
}

/**
 * Combined options for one-step conversion functions
 */
export interface ConvertOptions extends FilterOptions, ConverterOptions {
  /** Base URL for resolving relative links */
  baseUrl?: string;
}

/**
 * Result object for HTML filtering operations
 */
export interface FilterResult {
  /** Filtered HTML content as string */
  content: string;
  /** Filtered HTML content as array of fragments */
  fragments: string[];
  /** Original HTML content */
  original: string;
  /** Filtering metadata */
  metadata: FilterMetadata;
}

/**
 * Metadata about the filtering process
 */
export interface FilterMetadata {
  /** Original content length */
  originalLength: number;
  /** Filtered content length */
  filteredLength: number;
  /** Reduction percentage */
  reductionPercent: number;
  /** Number of elements removed */
  elementsRemoved: number;
  /** Processing time in milliseconds */
  processingTime: number;
}

/**
 * Result object for Markdown conversion operations
 */
export interface MarkdownResult {
  /** Raw Markdown content */
  content: string;
  /** Markdown with citations (if enabled) */
  contentWithCitations?: string;
  /** References section markdown */
  references?: string;
  /** Metadata about the conversion */
  metadata: MarkdownMetadata;
}

/**
 * Metadata about the Markdown conversion process
 */
export interface MarkdownMetadata {
  /** Word count in the result */
  wordCount: number;
  /** Number of links found */
  linkCount: number;
  /** Number of images found */
  imageCount: number;
  /** Number of headings found */
  headingCount: number;
  /** Processing time in milliseconds */
  processingTime: number;
  /** Source content length */
  sourceLength: number;
}

/**
 * Plugin interface for extending functionality
 */
export interface Plugin {
  /** Plugin name (must be unique) */
  name: string;
  /** Plugin version */
  version?: string;
  /** Plugin description */
  description?: string;
  /** HTML filter transformation function */
  filter?: (html: string, context: PluginContext) => string;
  /** Markdown conversion transformation function */
  convert?: (markdown: string, context: PluginContext) => string;
  /** Plugin initialization function */
  init?: (options?: any) => void;
  /** Plugin cleanup function */
  destroy?: () => void;
}

/**
 * Context object passed to plugin functions
 */
export interface PluginContext {
  /** Current processing options */
  options: ProcessorOptions;
  /** Base URL being used */
  baseUrl?: string;
  /** Original HTML content */
  originalHtml: string;
  /** Processing metadata */
  metadata: Record<string, any>;
}

/**
 * Legacy type definitions for backward compatibility
 */
export interface MarkdownGenerationResult {
  /** Raw Markdown output */
  rawMarkdown: string;
  /** Markdown output with link citations */
  markdownWithCitations: string;
  /** Markdown for the references section */
  referencesMarkdown: string;
  /** Markdown generated from filtered HTML */
  fitMarkdown: string;
  /** Filtered HTML content */
  fitHtml: string;
}

/**
 * Legacy options for HTML to text conversion
 */
export interface Html2TextOptions {
  /** Text width for line wrapping; 0 means no wrapping */
  bodyWidth?: number;
  /** Whether to ignore emphasis (bold, italic) */
  ignoreEmphasis?: boolean;
  /** Whether to ignore links */
  ignoreLinks?: boolean;
  /** Whether to ignore images */
  ignoreImages?: boolean;
  /** Whether to protect links from being converted */
  protectLinks?: boolean;
  /** Whether to use a single newline for line breaks */
  singleLineBreak?: boolean;
  /** Whether to mark code blocks */
  markCode?: boolean;
  /** Whether to escape special Markdown characters */
  escapeSnob?: boolean;
  /** Whether to skip internal links (e.g., #anchor) */
  skipInternalLinks?: boolean;
  /** Whether to include superscript and subscript tags */
  includeSuperSub?: boolean;
}

/**
 * Error types for better error handling
 */
export class ProcessorError extends Error {
  constructor(message: string, public code: string, public cause?: Error) {
    super(message);
    this.name = 'ProcessorError';
  }
}

export class FilterError extends ProcessorError {
  constructor(message: string, cause?: Error) {
    super(message, 'FILTER_ERROR', cause);
    this.name = 'FilterError';
  }
}

export class ConversionError extends ProcessorError {
  constructor(message: string, cause?: Error) {
    super(message, 'CONVERSION_ERROR', cause);
    this.name = 'ConversionError';
  }
}

export class PluginError extends ProcessorError {
  constructor(message: string, public pluginName: string, cause?: Error) {
    super(message, 'PLUGIN_ERROR', cause);
    this.name = 'PluginError';
  }
} 