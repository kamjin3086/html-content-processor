/**
 * DOM Adapter - Provides unified DOM API for both browser and Node.js environments
 */

export interface DOMParserInterface {
  parseFromString(str: string, type: DOMParserSupportedType): Document;
}

export interface DocumentInterface {
  createNodeIterator(root: Node, whatToShow?: number, filter?: NodeFilter | null): NodeIterator;
  createElement(tagName: string): Element;
  body: HTMLElement | null;
}

export interface WindowInterface {
  DOMParser: new() => DOMParserInterface;
  document: DocumentInterface;
  NodeFilter: {
    SHOW_COMMENT: number;
  };
  Node?: {
    TEXT_NODE: number;
    ELEMENT_NODE: number;
  };
}

// Node type constants for cross-environment compatibility
export const NODE_TYPES = {
  TEXT_NODE: 3,
  ELEMENT_NODE: 1,
  COMMENT_NODE: 8
};

/**
 * Environment detection and DOM setup
 */
class DOMAdapter {
  private static instance: DOMAdapter;
  private _window: WindowInterface | null = null;
  private _isNode: boolean;

  private constructor() {
    this._isNode = typeof window === 'undefined';
    this.setupEnvironment();
  }

  public static getInstance(): DOMAdapter {
    if (!DOMAdapter.instance) {
      DOMAdapter.instance = new DOMAdapter();
    }
    return DOMAdapter.instance;
  }

  public get isNode(): boolean {
    return this._isNode;
  }

  public get isBrowser(): boolean {
    return !this._isNode;
  }

  private setupEnvironment(): void {
    if (this._isNode) {
      this.setupNodeEnvironment();
    } else {
      this.setupBrowserEnvironment();
    }
  }

  private setupNodeEnvironment(): void {
    try {
      // Only try to load jsdom in actual Node.js environment, not during webpack bundling
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        const jsdom = eval('require')('jsdom');
        if (jsdom && jsdom.JSDOM) {
          const { JSDOM } = jsdom;
          const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
          
          this._window = {
            DOMParser: dom.window.DOMParser,
            document: dom.window.document,
            NodeFilter: dom.window.NodeFilter,
            Node: dom.window.Node
          };
          return;
        }
      }
    } catch (error) {
      // jsdom not available or loading failed
      console.warn('jsdom not found. Installing jsdom is recommended for better performance: npm install jsdom');
    }
    
    // Fallback implementation
    this.setupFallbackEnvironment();
  }

  private setupBrowserEnvironment(): void {
    if (typeof window !== 'undefined' && window.DOMParser && window.document) {
      this._window = {
        DOMParser: window.DOMParser,
        document: window.document,
        NodeFilter: window.NodeFilter,
        Node: window.Node
      };
    } else {
      throw new Error('Browser environment does not support required DOM APIs');
    }
  }

  private setupFallbackEnvironment(): void {
    // Minimal fallback implementation using basic HTML parsing
    const createBasicParser = () => {
      return {
        parseFromString: (str: string, type: DOMParserSupportedType): Document => {
          // Very basic HTML parsing fallback
          // This is a simplified implementation - jsdom is strongly recommended
          const mockDoc = {
            documentElement: {
              outerHTML: str,
              innerHTML: str,
              textContent: str.replace(/<[^>]*>/g, ''),
              querySelectorAll: () => [],
              querySelector: () => null,
              remove: () => {},
              children: [],
              childNodes: [],
              parentNode: null,
              ownerDocument: null
            },
            body: {
              innerHTML: str,
              textContent: str.replace(/<[^>]*>/g, ''),
              querySelectorAll: () => [],
              querySelector: () => null,
              children: [],
              childNodes: [],
              getElementsByTagName: () => [],
              remove: () => {}
            },
            createNodeIterator: () => ({
              nextNode: () => null
            }),
            createElement: (tag: string) => ({
              tagName: tag.toUpperCase(),
              innerHTML: '',
              textContent: '',
              remove: () => {},
              children: [],
              childNodes: [],
              parentNode: null
            }),
            getElementsByTagName: () => []
          };
          return mockDoc as any;
        }
      };
    };

    this._window = {
      DOMParser: createBasicParser as any,
      document: {
        createNodeIterator: () => ({ nextNode: () => null }) as any,
        createElement: (tag: string) => ({ tagName: tag, remove: () => {} }) as any,
        body: null
      },
      NodeFilter: {
        SHOW_COMMENT: 128
      },
      Node: NODE_TYPES
    };
  }

  public getDOMParser(): DOMParserInterface {
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return new this._window.DOMParser();
  }

  public getDocument(): DocumentInterface {
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return this._window.document;
  }

  public getNodeFilter() {
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return this._window.NodeFilter;
  }

  public getNode() {
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return this._window.Node || NODE_TYPES;
  }

  /**
   * Parse HTML string to Document
   */
  public parseHTML(html: string): Document {
    const parser = this.getDOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  /**
   * Check if jsdom is available and properly loaded
   */
  public hasJSDOM(): boolean {
    if (!this._isNode) return false;
    
    try {
      if (typeof process !== 'undefined' && process.versions && process.versions.node) {
        eval('require')('jsdom');
        return true;
      }
    } catch {
      // jsdom not available
    }
    return false;
  }

  /**
   * Get environment information
   */
  public getEnvironmentInfo() {
    return {
      isNode: this._isNode,
      isBrowser: this.isBrowser,
      hasJSDOM: this.hasJSDOM(),
      hasNativeDOM: !this._isNode && typeof window !== 'undefined'
    };
  }
}

// Export singleton instance
export const domAdapter = DOMAdapter.getInstance();

// Export convenience functions
export const parseHTML = (html: string) => domAdapter.parseHTML(html);
export const getDOMParser = () => domAdapter.getDOMParser();
export const getDocument = () => domAdapter.getDocument();
export const getNodeFilter = () => domAdapter.getNodeFilter();
export const getNode = () => domAdapter.getNode();
export const isNode = () => domAdapter.isNode;
export const isBrowser = () => domAdapter.isBrowser; 