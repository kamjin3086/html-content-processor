/**
 * HTML Filter - for cleaning and filtering HTML content
 * Based on the Python version of PruningContentFilter
 */

import { parseHTML, getDocument, getNodeFilter } from './dom-adapter';

interface FilterMetrics {
  node: HTMLElement;
  tagName: string;
  textLen: number;
  tagLen: number;
  linkTextLen: number;
}

interface TagWeights {
  [key: string]: number;
}

export class HtmlFilter {
  private includedTags: Set<string>;
  private excludedTags: Set<string>;
  private headerTags: Set<string>;
  private negativePattern: RegExp;
  private minWordCount: number;
  private threshold: number;
  private thresholdType: 'fixed' | 'dynamic';
  private tagImportance: TagWeights;
  private metricConfig: {
    textDensity: boolean;
    linkDensity: boolean;
    tagWeight: boolean;
    classIdWeight: boolean;
    textLength: boolean;
  };
  private metricWeights: {
    textDensity: number;
    linkDensity: number;
    tagWeight: number;
    classIdWeight: number;
    textLength: number;
  };

  constructor(minWordThreshold?: number, thresholdType: 'fixed' | 'dynamic' = 'dynamic', threshold: number = 0.48) {
    this.includedTags = new Set([
      'p', 'div', 'article', 'section', 'main', 'content', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'pre', 'code', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'figure', 'figcaption', 'img', 'video', 'audio', 'embed', 'iframe', 'object',
      'strong', 'em', 'b', 'i', 'u', 'mark', 'small', 'del', 'ins', 'sub', 'sup',
      'a', 'span', 'time', 'address', 'cite', 'q', 'dfn', 'abbr', 'data', 'var', 'samp', 'kbd',
      'br', 'hr', 'wbr'
    ]);

    this.excludedTags = new Set([
      'nav', 'header', 'footer', 'aside', 'menu', 'menuitem',
      'script', 'style', 'meta', 'link', 'title', 'head',
      'noscript', 'template', 'slot',
      'form', 'input', 'textarea', 'button', 'select', 'option', 'optgroup', 'label', 'fieldset', 'legend',
      'canvas', 'svg', 'math'
    ]);

    this.headerTags = new Set(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']);

    this.negativePattern = /comment|meta|footer|footnote|sidebar|nav|advertisement|banner|social|share|related|recommended|trending|popular|ads?|popup|modal|overlay|cookie|consent|notification|breadcrumb|pagination|search-suggest|autocomplete/i;

    this.minWordCount = minWordThreshold || 2;
    this.threshold = threshold;
    this.thresholdType = thresholdType;

    this.tagImportance = {
      'article': 1.5,
      'main': 1.5,
      'section': 1.2,
      'div': 0.6,
      'p': 1.1,
      'h1': 1.4, 'h2': 1.3, 'h3': 1.2, 'h4': 1.15, 'h5': 1.1, 'h6': 1.05,
      'blockquote': 1.1,
      'ul': 0.9, 'ol': 0.9, 'li': 0.85,
      'table': 0.9, 'tr': 0.8, 'td': 0.8, 'th': 0.85,
      'figure': 1.0, 'figcaption': 0.9,
      'code': 0.9, 'pre': 0.9,
      'strong': 0.95, 'em': 0.95, 'b': 0.9, 'i': 0.9,
      'a': 0.8, 'span': 0.6
    };

    this.metricConfig = {
      textDensity: true,
      linkDensity: true,
      tagWeight: true,
      classIdWeight: true,
      textLength: true
    };

    this.metricWeights = {
      textDensity: 0.35,
      linkDensity: 0.15,
      tagWeight: 0.25,
      classIdWeight: 0.15,
      textLength: 0.1
    };
  }

  /**
   * Filters HTML content and returns an array of HTML blocks.
   * @param html HTML string
   * @returns Array of HTML blocks after filtering
   */
  public async filterContent(html: string): Promise<string[]> {
    if (!html) {
      return [];
    }

    let doc = await parseHTML(html);
    
    // If no body, add one
    if (!doc.body) {
      doc = await parseHTML(`<body>${html}</body>`);
    }

    await this.removeComments(doc);
    this.removeUnwantedTags(doc);

    const body = doc.body;
    this.pruneTree(body);

    const contentBlocks: string[] = [];
    Array.from(body.children).forEach(element => {
      if (element.textContent && element.textContent.trim().length > 0) {
        contentBlocks.push(element.outerHTML);
      }
    });

    return contentBlocks;
  }

  /**
   * Filters HTML content and returns a concatenated HTML string.
   * @param html HTML string
   * @returns Concatenated HTML string after filtering
   */
  public async filterContentAsString(html: string): Promise<string> {
    const blocks = await this.filterContent(html);
    return blocks.join('');
  }

  /**
   * Removes HTML comments from the document.
   * @param doc DOM document
   */
  private async removeComments(doc: Document): Promise<void> {
    const nodeFilter = await getNodeFilter();
    const document = await getDocument();
    
    const nodeIterator = document.createNodeIterator(
      doc,
      nodeFilter.SHOW_COMMENT,
      null 
    );
    
    let node: Comment | null;
    const nodesToRemove: Comment[] = [];
    
    // First, collect all comment nodes
    while ((node = nodeIterator.nextNode() as Comment | null)) {
      if (node) {
        nodesToRemove.push(node);
      }
    }
    
    // Then, remove them
    nodesToRemove.forEach(commentNode => {
      commentNode.parentNode?.removeChild(commentNode);
    });
  }

  /**
   * Removes unwanted tags from the document.
   * @param doc DOM document
   */
  private removeUnwantedTags(doc: Document): void {
    // Remove standard excluded tags
    this.excludedTags.forEach(tag => {
      const elements = doc.getElementsByTagName(tag);
      // Convert to array as the collection changes during iteration
      Array.from(elements).forEach(element => {
        element.parentNode?.removeChild(element);
      });
    });

    // Remove elements with noise-indicating attributes
    const noiseSelectors = [
      // Hidden elements
      '[style*="display:none"]',
      '[style*="visibility:hidden"]',
      '[hidden]',
      
      // Ad-related
      '[class*="ad"]', '[id*="ad"]',
      '[class*="advertisement"]', '[id*="advertisement"]',
      '[class*="banner"]', '[id*="banner"]',
      
      // Search engine specific noise
      '[class*="suggest"]', '[id*="suggest"]',
      '[class*="autocomplete"]', '[id*="autocomplete"]',
      '[class*="dropdown"]', '[id*="dropdown"]',
      '[class*="popup"]', '[id*="popup"]',
      '[class*="modal"]', '[id*="modal"]',
      '[class*="overlay"]', '[id*="overlay"]',
      
      // Navigation and UI noise
      '[class*="breadcrumb"]', '[id*="breadcrumb"]',
      '[class*="pagination"]', '[id*="pagination"]',
      '[class*="toolbar"]', '[id*="toolbar"]',
      '[class*="sidebar"]', '[id*="sidebar"]',
      
      // Cookie and notification banners
      '[class*="cookie"]', '[id*="cookie"]',
      '[class*="consent"]', '[id*="consent"]',
      '[class*="notification"]', '[id*="notification"]'
    ];

    noiseSelectors.forEach(selector => {
      try {
        const elements = doc.querySelectorAll(selector);
        Array.from(elements).forEach(element => {
          // Only remove if it's not a main content container
          if (!this.isMainContentContainer(element)) {
            element.parentNode?.removeChild(element);
          }
        });
      } catch (error) {
        // Selector might not be supported, continue
      }
    });
  }

  /**
   * Check if element is a main content container that should be preserved
   */
  private isMainContentContainer(element: Element): boolean {
    const tag = element.tagName.toLowerCase();
    const className = element.className.toLowerCase();
    const id = element.id.toLowerCase();
    
    // Preserve semantic content elements
    if (['main', 'article', 'section'].includes(tag)) {
      return true;
    }
    
    // Preserve elements with content-indicating names
    const contentIndicators = ['content', 'main', 'article', 'post', 'entry', 'text'];
    return contentIndicators.some(indicator => 
      className.includes(indicator) || id.includes(indicator)
    );
  }

  /**
   * Prunes the tree structure.
   * @param node Current node
   */
  private pruneTree(node: HTMLElement): void {
    if (!node || !node.tagName) {
      return;
    }

    const tagName = node.tagName.toLowerCase();
    
    const textLen = node.textContent ? node.textContent.trim().length : 0;
    const tagLen = node.innerHTML.length;
    const linkTextLen = Array.from(node.querySelectorAll('a'))
      .reduce((sum, a) => sum + (a.textContent ? a.textContent.trim().length : 0), 0);

    const metrics: FilterMetrics = {
      node: node,
      tagName: tagName,
      textLen: textLen,
      tagLen: tagLen,
      linkTextLen: linkTextLen
    };

    const score = this.computeCompositeScore(metrics, textLen, tagLen, linkTextLen);

    let shouldRemove = false;
    if (this.thresholdType === 'fixed') {
      shouldRemove = score < this.threshold;
    } else { // dynamic
      const tagImportanceValue = this.tagImportance[metrics.tagName] || 0.7;
      const textRatio = tagLen > 0 ? textLen / tagLen : 0;
      // const linkRatio = textLen > 0 ? linkTextLen / textLen : 1; // linkRatio seems unused

      let currentThreshold = this.threshold; // Base threshold
      if (tagImportanceValue > 1) {
        currentThreshold *= 0.8; // Lower threshold for important tags
      }
      if (textRatio > 0.4) { // Lower threshold for high text density
        currentThreshold *= 0.9;
      }
      // Consider additional adjustments for linkRatio if it's relevant
      shouldRemove = score < currentThreshold;
    }

    if (shouldRemove && node.parentNode && node.parentNode !== node.ownerDocument) {
      node.parentNode.removeChild(node);
      return; 
    }

    // Recursively prune children
    // Convert HTMLCollection to array for safe iteration while modifying the DOM
    const children = Array.from(node.children) as HTMLElement[];
    for (let i = 0; i < children.length; i++) {
      this.pruneTree(children[i]);
    }

    // After processing children, re-evaluate the current node
    // This handles cases where children removal might make the parent insignificant
    if (node.children.length === 0 && (node.textContent || '').trim().length === 0 && !this.isEssentialTag(tagName)) {
        if (this.countWords(node.textContent || '') < this.minWordCount && node.parentNode && node.parentNode !== node.ownerDocument) {
            const parent = node.parentNode;
            parent.removeChild(node);
            // If parent becomes empty after child removal, it might also need pruning in a subsequent pass or by adjusting logic
        }
    }
  }

  private isEssentialTag(tagName: string): boolean {
    // Define tags that should not be removed even if empty, e.g., <br>, <img>
    // For now, let's assume no such tags or handle them based on existing includedTags
    return this.includedTags.has(tagName); // Placeholder logic
  }


  /**
   * Computes a composite score for a node based on various metrics.
   * @param metrics Filter metrics for the node
   * @param textLen Length of text content
   * @param tagLen Length of HTML content
   * @param linkTextLen Length of text within links
   * @returns Composite score
   */
  private computeCompositeScore(
    metrics: FilterMetrics, 
    textLen: number, 
    tagLen: number, 
    linkTextLen: number
  ): number {
    let score = 0;
    let totalWeight = 0;

    if (this.metricConfig.textDensity) {
      const density = tagLen > 0 ? textLen / tagLen : 0;
      score += density * this.metricWeights.textDensity;
      totalWeight += this.metricWeights.textDensity;
    }
    if (this.metricConfig.linkDensity) {
      const linkDensity = textLen > 0 ? linkTextLen / textLen : 0;
      // Penalize high link density (often indicates navigation or ads)
      score -= linkDensity * this.metricWeights.linkDensity; 
      totalWeight += this.metricWeights.linkDensity; // Weight is added, but value is subtracted
    }
    if (this.metricConfig.tagWeight) {
      const tagWeight = this.tagImportance[metrics.tagName] || 0.5; // Default weight for unknown tags
      score += tagWeight * this.metricWeights.tagWeight;
      totalWeight += this.metricWeights.tagWeight;
    }
    if (this.metricConfig.classIdWeight) {
      const classIdWeight = this.computeClassIdWeight(metrics.node);
      // Negative patterns reduce the score
      score += classIdWeight * this.metricWeights.classIdWeight; 
      totalWeight += this.metricWeights.classIdWeight;
    }
    if (this.metricConfig.textLength) {
      // Normalize text length score (e.g., based on an expected average or max length)
      // Simple approach: penalize very short text, reward longer text up to a point
      const lengthScore = Math.min(1, textLen / 100); // Example normalization
      score += lengthScore * this.metricWeights.textLength;
      totalWeight += this.metricWeights.textLength;
    }
    
    // Normalize score by total weight if weights don't sum to 1
    // This ensures the score is roughly within a predictable range (e.g., 0-1 if individual scores are normalized)
    return totalWeight > 0 ? score / totalWeight : 0;
  }

  /**
   * Computes a weight based on class names and ID.
   * Negative patterns (like 'comment', 'nav') decrease the score.
   * @param node HTML element
   * @returns Weight based on class/ID
   */
  private computeClassIdWeight(node: HTMLElement): number {
    let weight = 0;
    const classAndId = `${node.className} ${node.id}`.toLowerCase();

    if (this.negativePattern.test(classAndId)) {
      weight -= 0.5; // Significant penalty for negative patterns
    }
    // Add more sophisticated class/ID analysis if needed
    // e.g., positive patterns, specific class weights

    return weight;
  }

  /**
   * Counts words in a string.
   * @param text Input string
   * @returns Number of words
   */
  private countWords(text: string): number {
    if (!text) return 0;
    return text.trim().split(/\s+/).length;
  }
} 