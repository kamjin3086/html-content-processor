/**
 * Markdown Generator - for converting HTML to Markdown.
 */
import { Html2TextOptions, MarkdownGenerationResult } from './types';
import { CustomHtml2Text } from './html2text';
import { HtmlFilter } from './html-filter';

/**
 * Regex for link references, used to convert links to reference style.
 */
const LINK_PATTERN = /!?\[([^\]]+)\]\(([^)]+?)(?:\s+"([^"]*)")?\)/g;

/**
 * Quickly joins a base URL and a relative URL, handling common cases.
 * @param baseUrl The base URL.
 * @param url The URL to join.
 * @returns The joined URL.
 */
function fastUrlJoin(baseUrl: string, url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://') || 
      url.startsWith('mailto:') || url.startsWith('//') || url.startsWith('data:')) {
    return url;
  }
  
  // Handle absolute paths relative to the domain
  if (url.startsWith('/')) {
    if (baseUrl) {
        try {
            const base = new URL(baseUrl);
            return `${base.protocol}//${base.host}${url}`;
        } catch (e) {
            // If baseUrl is not a valid URL, it might be a path itself, or invalid
            // In this case, simple concatenation might be wrong, but it's a fallback
            return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) + url : baseUrl + url; 
        }
    } else {
        // If no baseUrl, an absolute path cannot be resolved meaningfully
        return url; 
    }
  }
  
  // Handle relative paths
  if (baseUrl) {
    try {
      return new URL(url, baseUrl).href;
    } catch (e) {
      // If URL construction fails (e.g. invalid base or relative URL), return original url
      return url; 
    }
  } else {
    // If no baseUrl, a relative path cannot be resolved meaningfully
    return url;
  }
}

export interface MarkdownGeneratorOptions extends Html2TextOptions {
  contentSource?: 'cleaned_html' | 'raw_html' | 'fit_html'; // Determines which HTML source to use for Markdown generation
}

export class DefaultMarkdownGenerator {
  private contentFilter: HtmlFilter | null;
  private options: MarkdownGeneratorOptions;
  
  /**
   * Creates a Markdown generator instance.
   * @param contentFilter Content filter instance.
   * @param options Generation options.
   */
  constructor(
    contentFilter: HtmlFilter | null = null,
    options: MarkdownGeneratorOptions = {}
  ) {
    this.contentFilter = contentFilter;
    this.options = {
      contentSource: 'cleaned_html', // Default to using cleaned HTML
      ...options
    };
  }
  
  /**
   * Converts links to reference style.
   * @param markdown Markdown text.
   * @param baseUrl Base URL for resolving relative links.
   * @returns A tuple containing the Markdown with references and the references section.
   */
  convertLinksToRefs(markdown: string, baseUrl: string = ''): [string, string] {
    const linkMap: Map<string, {refNum: number, description: string}> = new Map();
    const urlCache: Map<string, string> = new Map(); // Cache for resolved URLs
    const parts: string[] = [];
    let lastEnd = 0;
    let counter = 1;
    
    let match;
    while ((match = LINK_PATTERN.exec(markdown)) !== null) {
      parts.push(markdown.slice(lastEnd, match.index));
      const [fullMatch, text, url, title] = match;
      
      let resolvedUrl = url;
      if (baseUrl && !(url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('data:'))) {
        if (!urlCache.has(url)) {
          urlCache.set(url, fastUrlJoin(baseUrl, url));
        }
        resolvedUrl = urlCache.get(url) || url;
      }
      
      if (!linkMap.has(resolvedUrl)) {
        const descriptions: string[] = [];
        if (title) descriptions.push(title);
        // Add text as description only if it's different from title and not empty
        if (text && text.trim() && text !== title) descriptions.push(text.trim()); 
        
        linkMap.set(resolvedUrl, {refNum: counter, description: descriptions.length ? ': ' + descriptions.join(' - ') : ''});
        counter++;
      }
      
      const linkInfo = linkMap.get(resolvedUrl);
      if (linkInfo) {
        // Use ⟨n⟩ format for references to avoid conflict with square brackets in code
        const refText = text.trim() || resolvedUrl; // Use URL as text if text is empty
        if (!fullMatch.startsWith('!')) { // Regular link
          parts.push(`${refText}⟨${linkInfo.refNum}⟩`);
        } else { // Image
          parts.push(`![${refText}⟨${linkInfo.refNum}⟩]`);
        }
      }
      
      lastEnd = match.index + fullMatch.length;
    }
    
    parts.push(markdown.slice(lastEnd));
    const convertedText = parts.join('');
    
    if (linkMap.size === 0) {
        return [convertedText, '']; // No links, no references section
    }

    const references: string[] = ['\n\n## References\n\n'];
    // Sort links by their reference number for consistent output
    const sortedLinks = Array.from(linkMap.entries()).sort((a, b) => a[1].refNum - b[1].refNum);
    
    for (const [url, linkInfo] of sortedLinks) {
      references.push(`⟨${linkInfo.refNum}⟩ ${url}${linkInfo.description}\n`);
    }
    
    return [convertedText, references.join('')];
  }
  
  /**
   * Generates Markdown from HTML.
   * @param inputHtml Input HTML string.
   * @param baseUrl Base URL for resolving relative links.
   * @param html2textOptions Options for HTML to text conversion.
   * @param contentFilterOverride Optional override for the content filter.
   * @param citations Whether to generate citations for links.
   * @returns Markdown generation result object.
   */
  generateMarkdown(
    inputHtml: string,
    baseUrl: string = '',
    html2textOptions: Html2TextOptions = {},
    contentFilterOverride: HtmlFilter | null = null,
    citations: boolean = true
  ): MarkdownGenerationResult {
    try {
      const h = new CustomHtml2Text(baseUrl);
      const defaultOptions: Html2TextOptions = {
        bodyWidth: 0, // Disable text wrapping
        ignoreEmphasis: false,
        ignoreLinks: false,
        ignoreImages: false,
        protectLinks: false,
        singleLineBreak: true,
        markCode: true,
        escapeSnob: false,
      };
      
      const finalOptions = { ...defaultOptions, ...this.options, ...html2textOptions };
      h.updateParams(finalOptions);
      
      const effectiveHtml = inputHtml || '';
      
      let rawMarkdown: string;
      try {
        rawMarkdown = h.handle(effectiveHtml);
      } catch (e) {
        rawMarkdown = `Error converting HTML to markdown: ${e instanceof Error ? e.message : String(e)}`;
      }
      
      // Basic cleanup for Markdown (e.g., extra spaces before code blocks)
      rawMarkdown = rawMarkdown.replace(/^\s*```/gm, '```'); 
      
      let markdownWithCitations: string = rawMarkdown;
      let referencesMarkdown: string = '';
      
      if (citations) {
        try {
          [markdownWithCitations, referencesMarkdown] = this.convertLinksToRefs(rawMarkdown, baseUrl);
        } catch (e) {
          // Preserve raw markdown if citation generation fails
          referencesMarkdown = `\n\nError generating citations: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
      
      let fitMarkdown: string = '';
      let fitHtml: string = '';
      
      const filterToUse = contentFilterOverride || this.contentFilter;
      if (filterToUse) {
        try {
          const filteredChunks = filterToUse.filterContent(effectiveHtml);
          // Wrap each chunk in a div to maintain structure for Markdown conversion, or join directly if preferred
          fitHtml = filteredChunks.join('\n'); // Simpler join, CustomHtml2Text should handle block elements
          fitMarkdown = h.handle(fitHtml); 
          fitMarkdown = fitMarkdown.replace(/^\s*```/gm, '```'); // Cleanup for fitMarkdown as well
        } catch (e) {
          fitMarkdown = `Error generating fit markdown: ${e instanceof Error ? e.message : String(e)}`;
          fitHtml = `Error during HTML filtering for fit content: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
      
      return {
        rawMarkdown: rawMarkdown || '',
        markdownWithCitations: markdownWithCitations || '',
        referencesMarkdown: referencesMarkdown || '',
        fitMarkdown: fitMarkdown || rawMarkdown, // Fallback to rawMarkdown if fitMarkdown is empty/error
        fitHtml: fitHtml || ''
      };
    } catch (e) {
      const errorMsg = `Error in markdown generation: ${e instanceof Error ? e.message : String(e)}`;
      return {
        rawMarkdown: errorMsg,
        markdownWithCitations: errorMsg,
        referencesMarkdown: '',
        fitMarkdown: errorMsg, // Propagate error to fitMarkdown as well
        fitHtml: errorMsg
      };
    }
  }
} 