import { HtmlFilter } from './html-filter';
import { DefaultMarkdownGenerator, MarkdownGeneratorOptions } from './markdown-generator';
import {
  ProcessorOptions,
  FilterOptions,
  ConverterOptions,
  FilterResult,
  MarkdownResult,
  FilterMetadata,
  MarkdownMetadata,
  PluginContext,
  FilterError,
  ConversionError
} from './types';
import { getPreset, mergeWithPreset } from './presets';
import { pluginRegistry } from './plugin-manager';
import { pageTypeDetector, PageTypeResult } from './page-type-detector';
import { PageTypeDetector } from './page-type-detector';

/**
 * Main HTML processor class with fluent API
 */
export class HtmlProcessor {
  private htmlFilter: HtmlFilter;
  private markdownGenerator: DefaultMarkdownGenerator;
  private options: ProcessorOptions;
  private currentHtml: string;
  private baseUrl: string;
  private processed: boolean = false;
  private dom: Document | null = null;
  private filteredDom: Document | null = null;
  private filterStats: { processingTime: number; filteredElements: number } | null = null;
  private pageTypeResult: PageTypeResult | null = null;
  private autoDetectEnabled: boolean = false;

  /**
   * Create a new HtmlProcessor instance
   * @param options Processing options
   */
  constructor(options: ProcessorOptions = {}) {
    this.options = this.resolveOptions(options);
    this.htmlFilter = this.createHtmlFilter();
    this.markdownGenerator = this.createMarkdownGenerator();
    this.currentHtml = '';
    this.baseUrl = this.options.baseUrl || '';
  }

  /**
   * Static factory method to create processor from HTML
   * @param html HTML content to process
   * @param options Processing options
   * @returns New HtmlProcessor instance
   */
  static from(html: string, options: ProcessorOptions = {}): HtmlProcessor {
    const processor = new HtmlProcessor(options);
    processor.currentHtml = html || '';
    return processor;
  }

  /**
   * Set the base URL for resolving relative links
   * @param url Base URL
   * @returns This processor instance for chaining
   */
  withBaseUrl(url: string): HtmlProcessor {
    this.baseUrl = url;
    this.options.baseUrl = url;
    return this;
  }

  /**
   * Update processor options
   * @param options New options to merge
   * @returns This processor instance for chaining
   */
  withOptions(options: Partial<ProcessorOptions>): HtmlProcessor {
    this.options = {
      ...this.options,
      ...options,
      filter: {
        ...this.options.filter,
        ...options.filter
      },
      converter: {
        ...this.options.converter,
        ...options.converter
      }
    };

    // Recreate filter and generator with new options
    this.htmlFilter = this.createHtmlFilter();
    this.markdownGenerator = this.createMarkdownGenerator();
    this.processed = false;

    return this;
  }

  /**
   * Apply HTML filtering
   * @param options Filter options (optional)
   * @returns This processor instance for chaining
   */
  async filter(options?: FilterOptions): Promise<HtmlProcessor> {
    try {
      const startTime = Date.now();

      // Apply auto-detection if enabled
      if (this.autoDetectEnabled && !this.pageTypeResult) {
        await this.detectPageType();
      }

      // Merge filter options with auto-detected ones
      const mergedOptions: FilterOptions = {
        ...this.options.filter,
        ...(this.pageTypeResult?.filterOptions || {}),
        ...options
      };

      // Update options with merged options
      this.options.filter = mergedOptions;
      
      // Create or update HTML filter
      this.htmlFilter = this.createHtmlFilter();

      // Apply filter plugins
      const pluginContext: PluginContext = {
        options: this.options,
        baseUrl: this.baseUrl,
        originalHtml: this.currentHtml,
        metadata: {}
      };

      let htmlToFilter = pluginRegistry.applyFilterPlugins(this.currentHtml, pluginContext);

      // Apply HTML filtering
      const filteredContent = await this.htmlFilter.filterContentAsString(htmlToFilter);
      
      this.currentHtml = filteredContent || this.currentHtml;
      this.processed = true;

      const processingTime = Date.now() - startTime;
      if (this.options.debug) {
        console.log(`[HtmlProcessor] Filtering completed in ${processingTime}ms`);
      }

      return this;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new FilterError(`HTML filtering failed: ${errorMessage}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Convert to Markdown with optional custom options
   * @param options Converter options (optional)
   * @returns Markdown result
   */
  async toMarkdown(options?: ConverterOptions): Promise<MarkdownResult> {
    try {
      const startTime = Date.now();

      // Merge converter options if provided
      const converterOptions = { ...this.options.converter, ...options };
      
      // Create markdown generator options
      const mdOptions: MarkdownGeneratorOptions = {
        ignoreLinks: converterOptions.ignoreLinks,
        ignoreImages: converterOptions.ignoreImages,
        escapeSnob: converterOptions.escapeSpecialChars
      };

      // Generate markdown
      const result = await this.markdownGenerator.generateMarkdown(
        this.currentHtml,
        this.baseUrl,
        mdOptions,
        null,
        converterOptions.citations !== false
      );

      // Apply plugins to markdown content
      const pluginContext: PluginContext = {
        options: this.options,
        baseUrl: this.baseUrl,
        originalHtml: this.currentHtml,
        metadata: {}
      };

      let finalContent = pluginRegistry.applyConvertPlugins(result.rawMarkdown, pluginContext);

      const processingTime = Date.now() - startTime;

      // Create metadata
      const metadata: MarkdownMetadata = {
        wordCount: this.countWords(finalContent),
        linkCount: this.countMatches(finalContent, /\[([^\]]+)\]\([^)]+\)/g),
        imageCount: this.countMatches(finalContent, /!\[([^\]]*)\]\([^)]+\)/g),
        headingCount: this.countMatches(finalContent, /^#+\s/gm),
        processingTime,
        sourceLength: this.currentHtml.length
      };

      return {
        content: finalContent,
        contentWithCitations: result.markdownWithCitations,
        references: result.referencesMarkdown,
        metadata
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConversionError(`Markdown conversion failed: ${errorMessage}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Convert to plain text
   * @returns Plain text content
   */
  async toText(): Promise<string> {
    const markdown = await this.toMarkdown({ ignoreLinks: true, ignoreImages: true });
    return markdown.content
      .replace(/^#+\s*/gm, '') // Remove headers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove code formatting
      .replace(/\n{2,}/g, '\n\n') // Normalize line breaks
      .trim();
  }

  /**
   * Convert to array of HTML fragments
   * @returns Array of HTML fragments
   */
  async toArray(): Promise<string[]> {
    if (!this.currentHtml) {
      return [];
    }

    try {
      const fragments = await this.htmlFilter.filterContent(this.currentHtml);
      return fragments && fragments.length > 0 ? fragments : [this.currentHtml];
    } catch (error: unknown) {
      console.warn('[HtmlProcessor] Failed to convert to array:', error);
      return [this.currentHtml];
    }
  }

  /**
   * Get filtered HTML as string
   * @returns Filtered HTML string
   */
  toString(): string {
    return this.currentHtml;
  }

  /**
   * Get clean HTML (alias for toString)
   * @returns Clean HTML string
   */
  toClean(): string {
    return this.toString();
  }

  /**
   * Get detailed filter result with metadata
   * @returns Filter result with metadata
   */
  async getFilterResult(): Promise<FilterResult> {
    const originalHtml = this.currentHtml; // This is after filtering, need to track original
    const startTime = Date.now();
    
    try {
      const fragments = await this.toArray();
      const processingTime = Date.now() - startTime;

      const metadata: FilterMetadata = {
        originalLength: originalHtml.length,
        filteredLength: this.currentHtml.length,
        reductionPercent: originalHtml.length > 0 
          ? Math.round((1 - this.currentHtml.length / originalHtml.length) * 100) 
          : 0,
        elementsRemoved: this.countElements(originalHtml) - this.countElements(this.currentHtml),
        processingTime
      };

      return {
        content: this.currentHtml,
        fragments,
        original: originalHtml,
        metadata
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new FilterError(`Failed to generate filter result: ${errorMessage}`, error instanceof Error ? error : undefined);
    }
  }

  /**
   * Get current processing options
   * @returns Current options
   */
  getOptions(): ProcessorOptions {
    return JSON.parse(JSON.stringify(this.options)); // Deep clone
  }

  /**
   * Check if content has been processed
   * @returns True if content has been filtered
   */
  isProcessed(): boolean {
    return this.processed;
  }

  /**
   * Get current HTML content
   * @returns Current HTML content
   */
  getHtml(): string {
    return this.currentHtml;
  }

  /**
   * Get current base URL
   * @returns Current base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }

  /**
   * Resolve processing options with presets
   * @param options Input options
   * @returns Resolved options
   */
  private resolveOptions(options: ProcessorOptions): ProcessorOptions {
    if (options.preset) {
      return mergeWithPreset(options.preset, options);
    }

    // Apply default values
    return {
      filter: {
        threshold: 2,
        strategy: 'dynamic',
        ratio: 0.48,
        minWords: 0,
        preserveStructure: false,
        ...options.filter
      },
      converter: {
        citations: true,
        ignoreLinks: false,
        ignoreImages: false,
        format: 'github',
        linkStyle: 'inline',
        escapeSpecialChars: false,
        ...options.converter
      },
      baseUrl: options.baseUrl || '',
      preset: options.preset
    };
  }

  /**
   * Create HTML filter instance based on current options
   * @returns HtmlFilter instance
   */
  private createHtmlFilter(): HtmlFilter {
    const filterOpts = this.options.filter!;
    return new HtmlFilter(
      filterOpts.threshold || 2,
      filterOpts.strategy || 'dynamic',
      filterOpts.ratio || 0.48
    );
  }

  /**
   * Create markdown generator instance based on current options
   * @returns DefaultMarkdownGenerator instance
   */
  private createMarkdownGenerator(): DefaultMarkdownGenerator {
    const converterOpts = this.options.converter!;
    const mdOptions: MarkdownGeneratorOptions = {
      ignoreLinks: converterOpts.ignoreLinks || false,
      ignoreImages: converterOpts.ignoreImages || false,
      escapeSnob: converterOpts.escapeSpecialChars || false
    };

    return new DefaultMarkdownGenerator(this.htmlFilter, mdOptions);
  }

  /**
   * Count words in text
   * @param text Text to count
   * @returns Word count
   */
  private countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Count regex matches in text
   * @param text Text to search
   * @param regex Regular expression
   * @returns Match count
   */
  private countMatches(text: string, regex: RegExp): number {
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Count HTML elements in content
   * @param html HTML content
   * @returns Element count
   */
  private countElements(html: string): number {
    return this.countMatches(html, /<[^>]+>/g);
  }

  /**
   * Enable page type auto-detection with optional URL hint
   * @param url Optional URL for better detection accuracy
   * @returns This processor instance for chaining
   */
  async withAutoDetection(url?: string): Promise<HtmlProcessor> {
    this.autoDetectEnabled = true;
    
    // Detect page type immediately with current HTML and URL
    const pageTypeDetector = new PageTypeDetector();
    this.pageTypeResult = await pageTypeDetector.detectPageType(this.currentHtml, url || this.baseUrl);  
    
    if (this.options.debug && this.pageTypeResult) {
      console.log(`[HtmlProcessor] Auto-detected page type: ${this.pageTypeResult.type} (confidence: ${(this.pageTypeResult.confidence * 100).toFixed(1)}%)`);
      console.log(`[HtmlProcessor] Detection reasons:`, this.pageTypeResult.reasons);
    }

    // Update filter options with detected options
    this.options.filter = {
      ...this.options.filter,
      ...this.pageTypeResult.filterOptions
    };

    return this;
  }

  /**
   * Get page type detection result
   * @returns Page type detection result or null if not detected
   */
  getPageTypeResult(): PageTypeResult | null {
    return this.pageTypeResult;
  }

  /**
   * Check if auto-detection is enabled
   * @returns True if auto-detection is enabled
   */
  isAutoDetectionEnabled(): boolean {
    return this.autoDetectEnabled;
  }

  /**
   * Manually set page type (disables auto-detection)
   * @param pageType Page type to set
   * @returns This processor instance for chaining
   */
  async withPageType(pageType: string): Promise<HtmlProcessor> {
    this.autoDetectEnabled = false;
    const pageTypeDetector = new PageTypeDetector();
    this.pageTypeResult = await pageTypeDetector.detectPageType('');
    this.pageTypeResult.type = pageType as any;
    this.pageTypeResult.confidence = 1.0;
    this.pageTypeResult.reasons = [`Manually set to ${pageType}`];
    
    // Get filter options for this page type
    const filterOptions = (pageTypeDetector as any).getFilterOptionsForType(pageType, this.pageTypeResult.characteristics);
    this.pageTypeResult.filterOptions = filterOptions;
    
    // Update processor options
    this.options.filter = {
      ...this.options.filter,
      ...filterOptions
    };

    if (this.options.debug) {
      console.log(`[HtmlProcessor] Page type manually set to: ${pageType}`);
    }

    return this;
  }

  /**
   * Internal method to detect page type
   */
  private async detectPageType(): Promise<void> {
    if (!this.pageTypeResult) {
      const pageTypeDetector = new PageTypeDetector();
      this.pageTypeResult = await pageTypeDetector.detectPageType(this.currentHtml, this.baseUrl);
    }
  }
} 