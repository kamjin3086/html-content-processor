import { HtmlProcessor } from './html-processor';
import { ConvertOptions, ProcessorOptions, FilterOptions } from './types';
import { MarkdownResult } from './types';

/**
 * Convert HTML to Markdown with optional configuration
 * @param html HTML content to convert
 * @param options Conversion options
 * @returns Markdown string
 */
export async function htmlToMarkdown(html: string, options?: ConvertOptions): Promise<string> {
  const processor = HtmlProcessor.from(html, options?.baseUrl ? { baseUrl: options.baseUrl } : {});
  
  // Apply filtering if filter options are provided
  if (options && (options.threshold !== undefined || options.strategy !== undefined || options.ratio !== undefined)) {
    await processor.filter(options);
  } else {
    await processor.filter();
  }
  
  const result = await processor.toMarkdown(options);
  return result.content;
}

/**
 * Convert HTML to Markdown with citations
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @param options Conversion options
 * @returns Markdown string with citations
 */
export async function htmlToMarkdownWithCitations(html: string, baseUrl?: string, options?: ConvertOptions): Promise<string> {
  const processor = HtmlProcessor.from(html, { baseUrl });
  
  if (options && (options.threshold !== undefined || options.strategy !== undefined || options.ratio !== undefined)) {
    await processor.filter(options);
  } else {
    await processor.filter();
  }
  
  const result = await processor.toMarkdown({ ...options, citations: true });
  return result.contentWithCitations + (result.references ? '\n\n' + result.references : '');
}

/**
 * Convert HTML to plain text
 * @param html HTML content to convert
 * @param options Filter options
 * @returns Plain text string
 */
export async function htmlToText(html: string, options?: FilterOptions): Promise<string> {
  const processor = HtmlProcessor.from(html, { 
    filter: options,
    converter: { ignoreLinks: true, ignoreImages: true }
  });
  
  await processor.filter(options);
  return await processor.toText();
}

/**
 * Clean HTML by removing unwanted elements and content
 * @param html HTML content to clean
 * @param options Filter options
 * @returns Cleaned HTML string
 */
export async function cleanHtml(html: string, options?: FilterOptions): Promise<string> {
  const processor = HtmlProcessor.from(html, { filter: options });
  await processor.filter(options);
  return processor.toString();
}

/**
 * Extract main content from HTML as array of fragments
 * @param html HTML content to process
 * @param options Filter options
 * @returns Array of HTML content fragments
 */
export async function extractContent(html: string, options?: FilterOptions): Promise<string[]> {
  const processor = HtmlProcessor.from(html, { filter: options });
  await processor.filter(options);
  return await processor.toArray();
}

/**
 * Convert HTML to Markdown using article preset (optimized for long-form content)
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown string
 */
export async function htmlToArticleMarkdown(html: string, baseUrl?: string): Promise<string> {
  const processor = HtmlProcessor.from(html, { preset: 'article', baseUrl });
  await processor.filter();
  const result = await processor.toMarkdown();
  return result.content;
}

/**
 * Convert HTML to Markdown using blog preset (optimized for blog posts)
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown string
 */
export async function htmlToBlogMarkdown(html: string, baseUrl?: string): Promise<string> {
  const processor = HtmlProcessor.from(html, { preset: 'blog', baseUrl });
  await processor.filter();
  const result = await processor.toMarkdown();
  return result.content;
}

/**
 * Convert HTML to Markdown using news preset (optimized for news articles)
 * @param html HTML content to convert
 * @param baseUrl Base URL for resolving relative links
 * @returns Markdown string
 */
export async function htmlToNewsMarkdown(html: string, baseUrl?: string): Promise<string> {
  const processor = HtmlProcessor.from(html, { preset: 'news', baseUrl });
  await processor.filter();
  const result = await processor.toMarkdown();
  return result.content;
}

/**
 * Quick and aggressive HTML cleaning using strict preset
 * @param html HTML content to clean
 * @returns Cleaned HTML string
 */
export async function strictCleanHtml(html: string): Promise<string> {
  const processor = HtmlProcessor.from(html, { preset: 'strict' });
  await processor.filter();
  return processor.toString();
}

/**
 * Gentle HTML cleaning using loose preset
 * @param html HTML content to clean
 * @returns Cleaned HTML string
 */
export async function gentleCleanHtml(html: string): Promise<string> {
  const processor = HtmlProcessor.from(html, { preset: 'loose' });
  await processor.filter();
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

/**
 * Convert HTML to Markdown with automatic page type detection
 * @param html HTML content
 * @param url Optional URL for better detection accuracy
 * @param options Additional processing options
 * @returns Markdown result
 */
export async function htmlToMarkdownAuto(
  html: string, 
  url?: string, 
  options: Partial<ProcessorOptions> = {}
): Promise<MarkdownResult> {
  const processor = await HtmlProcessor.from(html, options)
    .withAutoDetection(url);
  await processor.filter();
  return await processor.toMarkdown();
}

/**
 * Clean HTML with automatic page type detection
 * @param html HTML content
 * @param url Optional URL for better detection accuracy
 * @param options Additional processing options
 * @returns Clean HTML string
 */
export async function cleanHtmlAuto(
  html: string, 
  url?: string, 
  options: Partial<ProcessorOptions> = {}
): Promise<string> {
  const processor = await HtmlProcessor.from(html, options)
    .withAutoDetection(url);
  await processor.filter();
  return processor.toString();
}

/**
 * Extract content with automatic page type detection and return detailed result
 * @param html HTML content
 * @param url Optional URL for better detection accuracy
 * @param options Additional processing options
 * @returns Detailed extraction result with page type information
 */
export async function extractContentAuto(
  html: string, 
  url?: string, 
  options: Partial<ProcessorOptions> = {}
): Promise<{
  markdown: MarkdownResult;
  pageType: import('./page-type-detector').PageTypeResult | null;
  cleanHtml: string;
}> {
  const processor = await HtmlProcessor.from(html, options)
    .withAutoDetection(url);
  await processor.filter();
    
  return {
    markdown: await processor.toMarkdown(),
    pageType: processor.getPageTypeResult(),
    cleanHtml: processor.toString()
  };
} 