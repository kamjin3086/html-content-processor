/**
 * HTML Filter - for cleaning and filtering HTML content
 * Based on the Python version of PruningContentFilter
 */

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
  private tagWeights: TagWeights; // Consider removing if redundant with tagImportance or clarifying its specific use
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

  constructor(minWordThreshold?: number, thresholdType: 'fixed' | 'dynamic' = 'fixed', threshold: number = 0.48) {
    this.includedTags = new Set([
      // Main structure
      "article", "main", "section", "div",
      // List structure
      "ul", "ol", "li", "dl", "dt", "dd",
      // Text content
      "p", "span", "blockquote", "pre", "code",
      // Headings
      "h1", "h2", "h3", "h4", "h5", "h6",
      // Tables
      "table", "thead", "tbody", "tr", "td", "th",
      // Other semantic elements
      "figure", "figcaption", "details", "summary",
      // Text formatting
      "em", "strong", "b", "i", "mark", "small",
      // Rich content
      "time", "address", "cite", "q",
    ]);

    this.excludedTags = new Set([
      "nav", "footer", "header", "aside", "script", "style", "form", "iframe", "noscript"
    ]);

    this.headerTags = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);
    this.negativePattern = /nav|footer|header|sidebar|ads|comment|promo|advert|social|share/i;
    this.minWordCount = minWordThreshold || 2;
    this.thresholdType = thresholdType;
    this.threshold = threshold;

    // Tag importance configuration
    this.tagImportance = {
      "article": 1.5,
      "main": 1.4,
      "section": 1.3,
      "p": 1.2,
      "h1": 1.4,
      "h2": 1.3,
      "h3": 1.2,
      "div": 0.7,
      "span": 0.6,
    };

    // Metric configuration
    this.metricConfig = {
      textDensity: true,
      linkDensity: true,
      tagWeight: true,
      classIdWeight: true,
      textLength: true,
    };

    this.metricWeights = {
      textDensity: 0.4,
      linkDensity: 0.2,
      tagWeight: 0.2,
      classIdWeight: 0.1,
      textLength: 0.1,
    };

    this.tagWeights = {
      "div": 0.5,
      "p": 1.0,
      "article": 1.5,
      "section": 1.0,
      "span": 0.3,
      "li": 0.5,
      "ul": 0.5,
      "ol": 0.5,
      "h1": 1.2,
      "h2": 1.1,
      "h3": 1.0,
      "h4": 0.9,
      "h5": 0.8,
      "h6": 0.7,
    };
  }

  /**
   * Filters HTML content and returns an array of filtered HTML fragments.
   * @param html HTML string
   * @returns Array of filtered HTML fragments
   */
  public filterContent(html: string): string[] {
    if (!html || typeof html !== 'string') {
      return [];
    }

    const parser = new DOMParser();
    let doc = parser.parseFromString(html, 'text/html');
    
    // If no body, add one
    if (!doc.body) {
      doc = parser.parseFromString(`<body>${html}</body>`, 'text/html');
    }

    this.removeComments(doc);
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
  public filterContentAsString(html: string): string {
    const blocks = this.filterContent(html);
    return blocks.join('');
  }

  /**
   * Removes HTML comments from the document.
   * @param doc DOM document
   */
  private removeComments(doc: Document): void {
    const nodeIterator = document.createNodeIterator(
      doc,
      NodeFilter.SHOW_COMMENT,
      // @ts-ignore
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
    this.excludedTags.forEach(tag => {
      const elements = doc.getElementsByTagName(tag);
      // Convert to array as the collection changes during iteration
      Array.from(elements).forEach(element => {
        element.parentNode?.removeChild(element);
      });
    });
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
      const tagWeight = this.tagWeights[metrics.tagName] || 0.5; // Default weight for unknown tags
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