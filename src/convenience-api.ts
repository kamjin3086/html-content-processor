import { HtmlProcessor } from './html-processor';
import { ConvertOptions, ProcessorOptions, FilterOptions } from './types';

/**
 * Convert HTML to Markdown with optional configuration
 * @param html HTML content to convert
 * @param options Conversion options
 * @returns Markdown string
 */
export function htmlToMarkdown(html: string, options?: ConvertOptions): string {
  const processor = HtmlProcessor.from(html, options);
  
  // Apply filtering if filter options are provided
  if (options && (options.threshold !== undefined || options.strategy !== undefined || options.ratio !== undefined)) {
    processor.filter(options);
  }
  
  if (options?.baseUrl) {
    processor.withBaseUrl(options.baseUrl);
  }
  
  const result = processor.toMarkdown(options);
  return result.content;
}

/**
 * Convert HTML to Markdown with citations and references
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @param options Additional options
 * @returns Complete markdown with citations and references
 */
export function htmlToMarkdownWithCitations(html: string, baseUrl?: string, options?: ConvertOptions): string {
  const converterOptions = { ...options, citations: true };
  const processor = HtmlProcessor.from(html, converterOptions);
  
  if (options && (options.threshold !== undefined || options.strategy !== undefined || options.ratio !== undefined)) {
    processor.filter(options);
  }
  
  if (baseUrl) {
    processor.withBaseUrl(baseUrl);
  }
  
  const result = processor.toMarkdown(converterOptions);
  return result.contentWithCitations + (result.references ? '\n\n' + result.references : '');
}

/**
 * Convert HTML to plain text
 * @param html HTML content to convert
 * @param options Filter options
 * @returns Plain text string
 */
export function htmlToText(html: string, options?: FilterOptions): string {
  const processor = HtmlProcessor.from(html, { 
    filter: options,
    converter: { ignoreLinks: true, ignoreImages: true }
  });
  
  if (options) {
    processor.filter(options);
  }
  
  return processor.toText();
}

/**
 * Clean HTML by removing unwanted elements and content
 * @param html HTML content to clean
 * @param options Filter options
 * @returns Cleaned HTML string
 */
export function cleanHtml(html: string, options?: FilterOptions): string {
  const processor = HtmlProcessor.from(html, { filter: options });
  processor.filter(options);
  return processor.toString();
}

/**
 * Extract main content from HTML as array of fragments
 * @param html HTML content to process
 * @param options Filter options
 * @returns Array of HTML content fragments
 */
export function extractContent(html: string, options?: FilterOptions): string[] {
  const processor = HtmlProcessor.from(html, { filter: options });
  processor.filter(options);
  return processor.toArray();
}

/**
 * Convert HTML to Markdown using article preset (optimized for long-form content)
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown string
 */
export function htmlToArticleMarkdown(html: string, baseUrl?: string): string {
  const processor = HtmlProcessor.from(html, { 
    preset: 'article',
    baseUrl 
  });
  
  processor.filter();
  const result = processor.toMarkdown();
  return result.content;
}

/**
 * Convert HTML to Markdown using blog preset (optimized for blog posts)
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown string
 */
export function htmlToBlogMarkdown(html: string, baseUrl?: string): string {
  const processor = HtmlProcessor.from(html, { 
    preset: 'blog',
    baseUrl 
  });
  
  processor.filter();
  const result = processor.toMarkdown();
  return result.content;
}

/**
 * Convert HTML to Markdown using news preset (optimized for news articles)
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown string
 */
export function htmlToNewsMarkdown(html: string, baseUrl?: string): string {
  const processor = HtmlProcessor.from(html, { 
    preset: 'news',
    baseUrl 
  });
  
  processor.filter();
  const result = processor.toMarkdown();
  return result.content;
}

/**
 * Quick and aggressive HTML cleaning using strict preset
 * @param html HTML content to clean
 * @returns Cleaned HTML string
 */
export function strictCleanHtml(html: string): string {
  const processor = HtmlProcessor.from(html, { preset: 'strict' });
  processor.filter();
  return processor.toString();
}

/**
 * Gentle HTML cleaning using loose preset
 * @param html HTML content to clean
 * @returns Cleaned HTML string
 */
export function gentleCleanHtml(html: string): string {
  const processor = HtmlProcessor.from(html, { preset: 'loose' });
  processor.filter();
  return processor.toString();
}

/**
 * Create a processor instance with custom configuration
 * @param options Processor configuration options
 * @returns Configured HtmlProcessor instance
 */
export function createProcessor(options?: ProcessorOptions): HtmlProcessor {
  return new HtmlProcessor(options);
} 