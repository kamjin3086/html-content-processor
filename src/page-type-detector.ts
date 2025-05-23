/**
 * Page Type Detector - Automatically detects page types and suggests optimal filtering parameters
 * Supports search engines, blogs, news sites, documentation, e-commerce, and more
 */

import { parseHTML } from './dom-adapter';
import { FilterOptions } from './types';

export interface PageTypeResult {
  /** Detected page type */
  type: PageType;
  /** Confidence score (0-1) */
  confidence: number;
  /** Recommended filter options */
  filterOptions: FilterOptions;
  /** Detection reasons */
  reasons: string[];
  /** Page characteristics */
  characteristics: PageCharacteristics;
}

export type PageType = 
  | 'search-engine'
  | 'blog'
  | 'news'
  | 'documentation'
  | 'e-commerce'
  | 'social-media'
  | 'forum'
  | 'landing-page'
  | 'article'
  | 'unknown';

export interface PageCharacteristics {
  /** Has search functionality */
  hasSearch: boolean;
  /** Has navigation menu */
  hasNavigation: boolean;
  /** Has article content */
  hasArticleContent: boolean;
  /** Has product listings */
  hasProductListings: boolean;
  /** Has social features */
  hasSocialFeatures: boolean;
  /** Has comments section */
  hasComments: boolean;
  /** Has code blocks */
  hasCodeBlocks: boolean;
  /** Link density ratio */
  linkDensity: number;
  /** Text to HTML ratio */
  textDensity: number;
  /** Number of forms */
  formCount: number;
  /** Number of images */
  imageCount: number;
}

interface DetectionRule {
  type: PageType;
  weight: number;
  check: (html: string, doc: Document, chars: PageCharacteristics) => boolean;
  reason: string;
}

export class PageTypeDetector {
  private detectionRules: DetectionRule[] = [
    // Search Engine Detection
    {
      type: 'search-engine',
      weight: 0.9,
      check: (html, doc) => this.hasSearchEngineIndicators(html, doc),
      reason: 'Contains search engine indicators (search box, results, suggestions)'
    },
    {
      type: 'search-engine',
      weight: 0.8,
      check: (html) => /baidu|google|bing|yahoo|duckduckgo|yandex/i.test(html),
      reason: 'Contains search engine domain indicators'
    },
    {
      type: 'search-engine',
      weight: 0.7,
      check: (html, doc, chars) => chars.hasSearch && chars.linkDensity > 0.6,
      reason: 'High link density with search functionality'
    },

    // Blog Detection
    {
      type: 'blog',
      weight: 0.8,
      check: (html, doc) => this.hasBlogIndicators(html, doc),
      reason: 'Contains blog-specific elements (posts, archives, categories)'
    },
    {
      type: 'blog',
      weight: 0.7,
      check: (html, doc, chars) => chars.hasArticleContent && chars.hasComments,
      reason: 'Has article content with comments section'
    },

    // News Detection
    {
      type: 'news',
      weight: 0.8,
      check: (html, doc) => this.hasNewsIndicators(html, doc),
      reason: 'Contains news-specific elements (headlines, bylines, timestamps)'
    },
    {
      type: 'news',
      weight: 0.7,
      check: (html) => /news|breaking|headline|reporter|journalist/i.test(html),
      reason: 'Contains news-related keywords'
    },

    // Documentation Detection
    {
      type: 'documentation',
      weight: 0.9,
      check: (html, doc, chars) => chars.hasCodeBlocks && this.hasDocIndicators(html, doc),
      reason: 'Contains code blocks and documentation structure'
    },
    {
      type: 'documentation',
      weight: 0.8,
      check: (html) => /api|docs|documentation|guide|tutorial|reference/i.test(html),
      reason: 'Contains documentation keywords'
    },

    // E-commerce Detection
    {
      type: 'e-commerce',
      weight: 0.8,
      check: (html, doc, chars) => chars.hasProductListings,
      reason: 'Contains product listings and pricing'
    },
    {
      type: 'e-commerce',
      weight: 0.7,
      check: (html) => /price|cart|buy|shop|product|order|checkout/i.test(html),
      reason: 'Contains e-commerce keywords'
    },

    // Social Media Detection
    {
      type: 'social-media',
      weight: 0.8,
      check: (html, doc, chars) => chars.hasSocialFeatures,
      reason: 'Contains social media features (likes, shares, follows)'
    },
    {
      type: 'social-media',
      weight: 0.7,
      check: (html) => /facebook|twitter|instagram|linkedin|social|follow|like|share/i.test(html),
      reason: 'Contains social media indicators'
    },

    // Forum Detection
    {
      type: 'forum',
      weight: 0.8,
      check: (html, doc) => this.hasForumIndicators(html, doc),
      reason: 'Contains forum structure (threads, posts, users)'
    },

    // Article Detection
    {
      type: 'article',
      weight: 0.7,
      check: (html, doc, chars) => chars.hasArticleContent && chars.textDensity > 0.4,
      reason: 'High text density with article structure'
    },

    // Landing Page Detection
    {
      type: 'landing-page',
      weight: 0.6,
      check: (html, doc, chars) => chars.formCount > 0 && chars.linkDensity < 0.3,
      reason: 'Contains forms with low link density (typical of landing pages)'
    }
  ];

  /**
   * Detects the page type based on HTML content and optional URL
   */
  public async detectPageType(html: string, url?: string): Promise<PageTypeResult> {
    if (!html || typeof html !== 'string') {
      return this.createUnknownResult('Empty or invalid HTML content');
    }

    try {
      const doc = await parseHTML(html);
      const characteristics = this.analyzePageCharacteristics(html, doc);
      const typeScores = this.calculateTypeScores(html, doc, characteristics, url);
      
      // Find the best match
      const bestMatch = Object.entries(typeScores)
        .sort(([,a], [,b]) => b.score - a.score)[0];

      if (!bestMatch || bestMatch[1].score < 0.3) {
        return this.createUnknownResult('No clear page type detected');
      }

      const [type, result] = bestMatch;
      const filterOptions = this.getFilterOptionsForType(type as PageType, characteristics);

      return {
        type: type as PageType,
        confidence: result.score,
        filterOptions,
        reasons: result.reasons,
        characteristics
      };

    } catch (error) {
      console.warn('[PageTypeDetector] Detection failed:', error);
      return this.createUnknownResult('Detection failed due to parsing error');
    }
  }

  /**
   * Analyze page characteristics
   */
  private analyzePageCharacteristics(html: string, doc: Document): PageCharacteristics {
    const body = doc.body || doc;
    
    // Calculate text and link density
    const textContent = body.textContent || '';
    const textLength = textContent.trim().length;
    const htmlLength = html.length;
    const textDensity = htmlLength > 0 ? textLength / htmlLength : 0;

    const links = body.querySelectorAll('a');
    const linkText = Array.from(links).reduce((sum, link) => 
      sum + (link.textContent?.trim().length || 0), 0);
    const linkDensity = textLength > 0 ? linkText / textLength : 0;

    return {
      hasSearch: this.hasSearchElements(doc),
      hasNavigation: this.hasNavigationElements(doc),
      hasArticleContent: this.hasArticleElements(doc),
      hasProductListings: this.hasProductElements(doc),
      hasSocialFeatures: this.hasSocialElements(doc),
      hasComments: this.hasCommentElements(doc),
      hasCodeBlocks: this.hasCodeElements(doc),
      linkDensity,
      textDensity,
      formCount: doc.querySelectorAll('form').length,
      imageCount: doc.querySelectorAll('img').length
    };
  }

  /**
   * Calculate scores for each page type
   */
  private calculateTypeScores(
    html: string, 
    doc: Document, 
    characteristics: PageCharacteristics,
    url?: string
  ): Record<string, { score: number; reasons: string[] }> {
    const scores: Record<string, { score: number; reasons: string[] }> = {};

    // Initialize all types
    const allTypes: PageType[] = [
      'search-engine', 'blog', 'news', 'documentation', 
      'e-commerce', 'social-media', 'forum', 'landing-page', 'article'
    ];
    
    allTypes.forEach(type => {
      scores[type] = { score: 0, reasons: [] };
    });

    // Apply URL-based hints
    if (url) {
      this.applyUrlHints(url, scores);
    }

    // Apply detection rules
    for (const rule of this.detectionRules) {
      try {
        if (rule.check(html, doc, characteristics)) {
          scores[rule.type].score += rule.weight;
          scores[rule.type].reasons.push(rule.reason);
        }
      } catch (error) {
        // Rule failed, continue with others
      }
    }

    // Normalize scores
    Object.keys(scores).forEach(type => {
      scores[type].score = Math.min(1, scores[type].score);
    });

    return scores;
  }

  /**
   * Apply URL-based hints for page type detection
   */
  private applyUrlHints(url: string, scores: Record<string, { score: number; reasons: string[] }>): void {
    const urlLower = url.toLowerCase();

    const urlHints = [
      { pattern: /google|bing|yahoo|baidu|duckduckgo/, type: 'search-engine', weight: 0.5 },
      { pattern: /blog|wordpress|medium|substack/, type: 'blog', weight: 0.4 },
      { pattern: /news|cnn|bbc|reuters|ap/, type: 'news', weight: 0.4 },
      { pattern: /docs|documentation|api|guide/, type: 'documentation', weight: 0.4 },
      { pattern: /shop|store|amazon|ebay|buy/, type: 'e-commerce', weight: 0.4 },
      { pattern: /facebook|twitter|instagram|linkedin/, type: 'social-media', weight: 0.4 },
      { pattern: /forum|reddit|stackoverflow/, type: 'forum', weight: 0.4 }
    ];

    for (const hint of urlHints) {
      if (hint.pattern.test(urlLower)) {
        scores[hint.type].score += hint.weight;
        scores[hint.type].reasons.push(`URL indicates ${hint.type} site`);
      }
    }
  }

  /**
   * Get optimal filter options for detected page type
   */
  private getFilterOptionsForType(type: PageType, characteristics: PageCharacteristics): FilterOptions {
    const baseOptions: FilterOptions = {
      threshold: 2,
      strategy: 'dynamic',
      ratio: 0.48,
      minWords: 2,
      preserveStructure: false
    };

    switch (type) {
      case 'search-engine':
        return {
          ...baseOptions,
          threshold: 8,
          strategy: 'dynamic',
          ratio: 0.2,
          minWords: 1,
          removeElements: ['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']
        };

      case 'blog':
        return {
          ...baseOptions,
          threshold: 3,
          strategy: 'dynamic',
          ratio: 0.4,
          minWords: 5,
          preserveStructure: true,
          keepElements: ['article', 'main', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote']
        };

      case 'news':
        return {
          ...baseOptions,
          threshold: 4,
          strategy: 'dynamic',
          ratio: 0.35,
          minWords: 10,
          preserveStructure: true,
          keepElements: ['article', 'main', 'h1', 'h2', 'h3', 'p', 'time', 'figure']
        };

      case 'documentation':
        return {
          ...baseOptions,
          threshold: 2,
          strategy: 'fixed',
          ratio: 0.3,
          minWords: 3,
          preserveStructure: true,
          keepElements: ['article', 'main', 'section', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'pre', 'code', 'ul', 'ol', 'li']
        };

      case 'e-commerce':
        return {
          ...baseOptions,
          threshold: 5,
          strategy: 'dynamic',
          ratio: 0.25,
          minWords: 2,
          removeElements: ['nav', 'header', 'footer', 'aside', 'form', 'script', 'style']
        };

      case 'social-media':
        return {
          ...baseOptions,
          threshold: 6,
          strategy: 'dynamic',
          ratio: 0.3,
          minWords: 3,
          removeElements: ['nav', 'header', 'footer', 'aside', 'script', 'style', 'form']
        };

      case 'forum':
        return {
          ...baseOptions,
          threshold: 3,
          strategy: 'dynamic',
          ratio: 0.35,
          minWords: 5,
          preserveStructure: true
        };

      case 'article':
        return {
          ...baseOptions,
          threshold: 2,
          strategy: 'fixed',
          ratio: 0.45,
          minWords: 10,
          preserveStructure: true,
          keepElements: ['article', 'main', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'figure']
        };

      case 'landing-page':
        return {
          ...baseOptions,
          threshold: 4,
          strategy: 'dynamic',
          ratio: 0.3,
          minWords: 5,
          removeElements: ['nav', 'header', 'footer', 'aside', 'script', 'style']
        };

      default:
        return baseOptions;
    }
  }

  // Helper methods for detecting specific page elements
  private hasSearchElements(doc: Document): boolean {
    const searchSelectors = [
      'input[type="search"]',
      'input[name*="search"]',
      'input[placeholder*="search"]',
      '.search-box',
      '#search',
      '[class*="search"]'
    ];
    
    return searchSelectors.some(selector => {
      try {
        return doc.querySelector(selector) !== null;
      } catch {
        return false;
      }
    });
  }

  private hasNavigationElements(doc: Document): boolean {
    return !!(doc.querySelector('nav') || 
             doc.querySelector('[role="navigation"]') ||
             doc.querySelector('.navigation') ||
             doc.querySelector('.nav') ||
             doc.querySelector('#nav'));
  }

  private hasArticleElements(doc: Document): boolean {
    return !!(doc.querySelector('article') ||
             doc.querySelector('[role="article"]') ||
             doc.querySelector('.article') ||
             doc.querySelector('.post') ||
             doc.querySelector('main'));
  }

  private hasProductElements(doc: Document): boolean {
    const productSelectors = [
      '.product',
      '.item',
      '[class*="price"]',
      '[class*="cart"]',
      '[class*="buy"]'
    ];
    
    return productSelectors.some(selector => {
      try {
        return doc.querySelector(selector) !== null;
      } catch {
        return false;
      }
    });
  }

  private hasSocialElements(doc: Document): boolean {
    const socialSelectors = [
      '[class*="like"]',
      '[class*="share"]',
      '[class*="follow"]',
      '[class*="social"]',
      '.fb-like',
      '.twitter-share'
    ];
    
    return socialSelectors.some(selector => {
      try {
        return doc.querySelector(selector) !== null;
      } catch {
        return false;
      }
    });
  }

  private hasCommentElements(doc: Document): boolean {
    const commentSelectors = [
      '.comment',
      '.comments',
      '#comments',
      '[class*="comment"]',
      '.disqus'
    ];
    
    return commentSelectors.some(selector => {
      try {
        return doc.querySelector(selector) !== null;
      } catch {
        return false;
      }
    });
  }

  private hasCodeElements(doc: Document): boolean {
    return !!(doc.querySelector('pre') ||
             doc.querySelector('code') ||
             doc.querySelector('.highlight') ||
             doc.querySelector('.code'));
  }

  private hasSearchEngineIndicators(html: string, doc: Document): boolean {
    const indicators = [
      // Search result indicators
      () => doc.querySelector('.search-result') !== null,
      () => doc.querySelector('.result') !== null,
      () => doc.querySelector('[class*="suggest"]') !== null,
      () => /search.*result|result.*search/i.test(html),
      () => /autocomplete|suggestion/i.test(html),
      // Search engine specific
      () => /google.*search|baidu.*search|bing.*search/i.test(html)
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  private hasBlogIndicators(html: string, doc: Document): boolean {
    const indicators = [
      () => doc.querySelector('.post') !== null,
      () => doc.querySelector('.entry') !== null,
      () => doc.querySelector('.blog') !== null,
      () => /posted.*by|published.*on|author/i.test(html),
      () => /category|tag|archive/i.test(html)
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  private hasNewsIndicators(html: string, doc: Document): boolean {
    const indicators = [
      () => doc.querySelector('time') !== null,
      () => doc.querySelector('.byline') !== null,
      () => doc.querySelector('.headline') !== null,
      () => /breaking|news|reporter|journalist/i.test(html),
      () => /published|updated|ago/i.test(html)
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  private hasDocIndicators(html: string, doc: Document): boolean {
    const indicators = [
      () => doc.querySelector('.toc') !== null,
      () => doc.querySelector('.table-of-contents') !== null,
      () => /table.*of.*contents|api.*reference/i.test(html),
      () => doc.querySelectorAll('h1, h2, h3, h4, h5, h6').length > 5
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  private hasForumIndicators(html: string, doc: Document): boolean {
    const indicators = [
      () => doc.querySelector('.thread') !== null,
      () => doc.querySelector('.post') !== null,
      () => doc.querySelector('.user') !== null,
      () => /thread|forum|discussion|reply/i.test(html),
      () => /joined|posts|reputation/i.test(html)
    ];

    return indicators.some(check => {
      try {
        return check();
      } catch {
        return false;
      }
    });
  }

  private createUnknownResult(reason: string): PageTypeResult {
    return {
      type: 'unknown',
      confidence: 0,
      filterOptions: {
        threshold: 2,
        strategy: 'dynamic',
        ratio: 0.48,
        minWords: 2,
        preserveStructure: false
      },
      reasons: [reason],
      characteristics: {
        hasSearch: false,
        hasNavigation: false,
        hasArticleContent: false,
        hasProductListings: false,
        hasSocialFeatures: false,
        hasComments: false,
        hasCodeBlocks: false,
        linkDensity: 0,
        textDensity: 0,
        formCount: 0,
        imageCount: 0
      }
    };
  }
}

// Export singleton instance
export const pageTypeDetector = new PageTypeDetector(); 