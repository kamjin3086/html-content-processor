/**
 * HTML to text conversion utility, used for converting HTML to Markdown.
 */
import { Html2TextOptions } from './types';
import { parseHTML, getNode } from './dom-adapter';

export class CustomHtml2Text {
  private options: Html2TextOptions;
  private baseUrl: string;

  /**
   * Creates an HTML to text converter instance.
   * @param baseUrl Base URL for resolving relative links.
   * @param options Conversion options.
   */
  constructor(baseUrl: string = '', options: Html2TextOptions = {}) {
    this.baseUrl = baseUrl;
    this.options = {
      bodyWidth: 0,  // Disable text wrapping
      ignoreEmphasis: false,
      ignoreLinks: false,
      ignoreImages: false,
      protectLinks: false,
      singleLineBreak: false,
      markCode: true,
      escapeSnob: false,
      skipInternalLinks: true,
      includeSuperSub: false,
      ...options
    };
  }

  /**
   * Updates conversion parameters.
   * @param options Options to update.
   */
  updateParams(options: Html2TextOptions): void {
    this.options = { ...this.options, ...options };
  }

  /**
   * Processes HTML and converts it to Markdown.
   * @param html HTML string.
   * @returns Converted Markdown.
   */
  handle(html: string): string {
    if (!html) return '';

    const doc = parseHTML(html);
    
    this.cleanDocument(doc);
    
    return this.domToMarkdown(doc.body);
  }

  /**
   * Cleans the document by removing unwanted elements.
   * @param doc Document object.
   */
  private cleanDocument(doc: Document): void {
    const scripts = doc.querySelectorAll('script');
    scripts.forEach(script => script.remove());

    const styles = doc.querySelectorAll('style');
    styles.forEach(style => style.remove());
    
    const unwantedTags = ['iframe', 'noscript', 'svg']; // Add other tags if needed
    unwantedTags.forEach(tag => {
      const elements = doc.querySelectorAll(tag);
      elements.forEach(el => el.remove());
    });
  }

  /**
   * Converts a DOM element to Markdown.
   * @param element DOM element.
   * @param _level Current heading level (unused in this simplified version, but kept for potential future use).
   * @returns Converted Markdown text.
   */
  private domToMarkdown(element: HTMLElement, _level: number = 0): string {
    if (!element) return '';

    let result = '';
    const tagName = element.tagName.toLowerCase();

    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
      case 'h5':
      case 'h6':
        const headerLevel = parseInt(tagName.substring(1));
        result += '\n' + '#'.repeat(headerLevel) + ' ' + this.getTextContent(element).trim() + '\n\n';
        break;
        
      case 'p':
        result += this.processChildren(element).trim() + '\n\n';
        break;
        
      case 'br':
        result += '\n'; // Or '  \n' for a hard line break in Markdown if singleLineBreak is false
        break;
        
      case 'hr':
        result += '\n---\n\n';
        break;
        
      case 'ul':
        result += this.processList(element, '*') + '\n';
        break;
        
      case 'ol':
        result += this.processList(element, '1.') + '\n';
        break;
        
      case 'li':
        // Li elements are typically handled by processList, this is a fallback or direct li handling
        result += '* ' + this.processChildren(element).trim() + '\n'; 
        break;
        
      case 'blockquote':
        result += this.processBlockquote(element) + '\n';
        break;
        
      case 'pre':
        const codeElement = element.querySelector('code');
        const codeContent = codeElement ? codeElement.textContent : element.textContent;
        const lang = codeElement?.className.match(/language-(\S+)/)?.[1] || '';
        result += '\n```' + lang + '\n' + (codeContent || '').trim() + '\n```\n\n';
        break;
        
      case 'code':
        if (element.parentElement?.tagName.toLowerCase() !== 'pre') {
          result += '`' + (element.textContent || '').trim() + '`';
        } else {
          // Code within <pre> is handled by the 'pre' case
          result += (element.textContent || '').trim(); 
        }
        break;
        
      case 'a':
        if (this.options.ignoreLinks) {
          result += this.getTextContent(element);
        } else {
          const href = element.getAttribute('href') || '';
          const text = this.getTextContent(element).trim();
          if (this.options.skipInternalLinks && (href.startsWith('#') || href === '')) {
            result += text;
          } else {
            const url = this.resolveUrl(href);
            const title = element.getAttribute('title') ? ` "${element.getAttribute('title')}"` : '';
            result += text ? `[${text}](${url}${title})` : `<${url}>`; // Handle empty link text
          }
        }
        break;
        
      case 'img':
        if (!this.options.ignoreImages) {
          const src = element.getAttribute('src') || '';
          const alt = element.getAttribute('alt') || '';
          const title = element.getAttribute('title') ? ` "${element.getAttribute('title')}"` : '';
          result += `![${alt}](${this.resolveUrl(src)}${title})`;
        }
        break;
        
      case 'strong':
      case 'b':
        if (!this.options.ignoreEmphasis) {
          result += '**' + this.processChildren(element).trim() + '**';
        } else {
          result += this.processChildren(element).trim();
        }
        break;
        
      case 'em':
      case 'i':
        if (!this.options.ignoreEmphasis) {
          result += '_' + this.processChildren(element).trim() + '_';
        } else {
          result += this.processChildren(element).trim();
        }
        break;
        
      case 'table':
        result += this.processTable(element) + '\n\n';
        break;
        
      case 'sup':
        if (this.options.includeSuperSub) {
          result += '^' + this.getTextContent(element).trim() + '^';
        } else {
          result += this.getTextContent(element).trim();
        }
        break;
        
      case 'sub':
        if (this.options.includeSuperSub) {
          result += '~' + this.getTextContent(element).trim() + '~';
        } else {
          result += this.getTextContent(element).trim();
        }
        break;
        
      default:
        result += this.processChildren(element);
    }

    return result;
  }

  /**
   * Gets the text content of an element, trimmed.
   * @param element DOM element.
   * @returns Trimmed text content.
   */
  private getTextContent(element: HTMLElement): string {
    if (!element) return '';
    return (element.textContent || '').trim();
  }

  /**
   * Processes the children of an element.
   * @param element Parent element.
   * @returns Processed Markdown for children.
   */
  private processChildren(element: HTMLElement): string {
    if (!element) return '';
    
    const Node = getNode();
    let result = '';
    Array.from(element.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Normalize whitespace in text nodes: replace multiple spaces/newlines with a single space
        result += (node.textContent || '').replace(/\s+/g, ' '); 
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        result += this.domToMarkdown(node as HTMLElement);
      }
    });
    
    // Trim spaces that might have been introduced, especially from mixed content or at the start/end of blocks
    return result.trim(); 
  }

  /**
   * Processes a list (ul or ol).
   * @param element List element (ul or ol).
   * @param marker List item marker ('*' or '1.').
   * @returns Markdown for the list.
   */
  private processList(element: HTMLElement, marker: string): string {
    let result = '';
    const items = element.querySelectorAll('li');
    items.forEach((item, index) => {
      const itemMarker = marker === '1.' ? `${index + 1}.` : marker;
      result += `${itemMarker} ${this.processChildren(item).trim()}\n`;
    });
    return result;
  }

  /**
   * Processes a blockquote element.
   * @param element Blockquote element.
   * @returns Markdown for the blockquote.
   */
  private processBlockquote(element: HTMLElement): string {
    const content = this.processChildren(element).trim();
    // Add '> ' to each line of the blockquote content
    return content.split('\n').map(line => '> ' + line).join('\n') + '\n';
  }

  /**
   * Processes a table element.
   * @param table Table element.
   * @returns Markdown for the table.
   */
  private processTable(table: HTMLElement): string {
    let result = '';
    const rows = Array.from(table.querySelectorAll('tr'));
    
    if (rows.length === 0) return '';

    // Process header
    const headerRow = rows.shift();
    if (headerRow) {
      const headerCells = Array.from(headerRow.querySelectorAll('th, td'))
                             .map(cell => this.getTextContent(cell as HTMLElement).replace(/\|/g, '\\|')); // Escape pipes
      result += `| ${headerCells.join(' | ')} |\n`;
      result += `|${headerCells.map(() => '---').join('|')}|\n`;
    }

    // Process body rows
    rows.forEach(row => {
      const cells = Array.from(row.querySelectorAll('td'))
                       .map(cell => this.getTextContent(cell as HTMLElement).replace(/\|/g, '\\|')); // Escape pipes
      result += `| ${cells.join(' | ')} |\n`;
    });

    return result;
  }

  /**
   * Resolves a URL against the base URL.
   * @param url URL to resolve.
   * @returns Absolute URL.
   */
  private resolveUrl(url: string): string {
    if (!this.baseUrl || url.startsWith('http') || url.startsWith('//') || url.startsWith('data:')) {
      return url;
    }
    try {
      return new URL(url, this.baseUrl).href;
    } catch (e) {
      // If URL construction fails (e.g. invalid base or relative URL), return original url
      return url; 
    }
  }
} 