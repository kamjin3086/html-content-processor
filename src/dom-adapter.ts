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
 * Environment detection utility
 */
class EnvironmentDetector {
  static detectEnvironment(): 'browser' | 'node' | 'webworker' | 'unknown' {
    // Use globalThis for modern environment detection
    if (typeof globalThis !== 'undefined') {
      // Use proper type checking for globalThis properties
      const global = globalThis as any;
      if (typeof global.document !== 'undefined' && typeof global.window !== 'undefined') {
        return 'browser';
      }
      if (typeof global.process !== 'undefined' && global.process?.versions?.node) {
        return 'node';
      }
      if (typeof global.WorkerGlobalScope !== 'undefined') {
        return 'webworker';
      }
    }
    
    // Fallback detection
    if (typeof window !== 'undefined') return 'browser';
    if (typeof process !== 'undefined' && process.versions?.node) return 'node';
    // Check for web worker environment safely
    if (typeof self !== 'undefined' && typeof (self as any).importScripts !== 'undefined') return 'webworker';
    
    return 'unknown';
  }

  static detectDOMParser(): boolean {
    try {
      return typeof DOMParser !== 'undefined' && new DOMParser() instanceof DOMParser;
    } catch {
      return false;
    }
  }

  static detectDocument(): boolean {
    return typeof document !== 'undefined' && 
           document?.createElement &&
           typeof document.createElement === 'function';
  }
}

/**
 * Browser DOM Adapter
 */
class BrowserAdapter {
  static isSupported(): boolean {
    return EnvironmentDetector.detectEnvironment() === 'browser' && 
           EnvironmentDetector.detectDOMParser() &&
           EnvironmentDetector.detectDocument();
  }

  static createWindow(): WindowInterface {
    if (!this.isSupported()) {
      throw new Error('Browser environment does not support required DOM APIs');
    }

    return {
      DOMParser: window.DOMParser,
      document: window.document,
      NodeFilter: window.NodeFilter,
      Node: window.Node
    };
  }
}

/**
 * Node.js DOM Adapter
 */
class NodeAdapter {
  private static jsdomCache: any = null;
  private static jsdomAvailable: boolean | null = null;

  static isSupported(): boolean {
    return EnvironmentDetector.detectEnvironment() === 'node';
  }

  static async createWindow(): Promise<WindowInterface> {
    if (!this.isSupported()) {
      throw new Error('Not in Node.js environment');
    }

    // Try to load jsdom using dynamic import
    const jsdom = await this.loadJSDOM();
    if (jsdom) {
      const { JSDOM } = jsdom;
      const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
      
      return {
        DOMParser: dom.window.DOMParser,
        document: dom.window.document,
        NodeFilter: dom.window.NodeFilter,
        Node: dom.window.Node
      };
    }

    // Fallback to basic implementation
    return this.createFallbackWindow();
  }

  private static async loadJSDOM(): Promise<any> {
    if (this.jsdomAvailable === false) {
      return null;
    }

    if (this.jsdomCache) {
      return this.jsdomCache;
    }

    try {
      // Use dynamic import instead of eval('require')
      // This works in both CommonJS and ESM environments
      const jsdom = await this.dynamicImport('jsdom');
      this.jsdomCache = jsdom;
      this.jsdomAvailable = true;
      return jsdom;
    } catch (error) {
      console.warn('jsdom not found. Installing jsdom is recommended for better performance: npm install jsdom');
      this.jsdomAvailable = false;
      return null;
    }
  }

  private static async dynamicImport(moduleName: string): Promise<any> {
    try {
      // Modern dynamic import approach
      return await import(moduleName);
    } catch (importError: any) {
      try {
        // Fallback for environments that might need require
        // Use Function constructor to avoid bundler analysis
        const requireFn = new Function('moduleName', 'return require(moduleName)');
        return requireFn(moduleName);
      } catch (requireError) {
        const errorMessage = importError?.message || 'Unknown import error';
        throw new Error(`Cannot load module ${moduleName}: ${errorMessage}`);
      }
    }
  }

  private static createFallbackWindow(): WindowInterface {
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

    return {
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

  static async hasJSDOM(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      await this.loadJSDOM();
      return this.jsdomAvailable === true;
    } catch {
      return false;
    }
  }
}

/**
 * Main DOM Adapter with automatic environment detection
 */
class DOMAdapter {
  private static instance: DOMAdapter;
  private _window: WindowInterface | null = null;
  private _environment: string;
  private _initialized: boolean = false;

  private constructor() {
    this._environment = EnvironmentDetector.detectEnvironment();
  }

  public static getInstance(): DOMAdapter {
    if (!DOMAdapter.instance) {
      DOMAdapter.instance = new DOMAdapter();
    }
    return DOMAdapter.instance;
  }

  public get isNode(): boolean {
    return this._environment === 'node';
  }

  public get isBrowser(): boolean {
    return this._environment === 'browser';
  }

  public get isWebWorker(): boolean {
    return this._environment === 'webworker';
  }

  private async ensureInitialized(): Promise<void> {
    if (this._initialized) return;

    if (BrowserAdapter.isSupported()) {
      this._window = BrowserAdapter.createWindow();
    } else if (NodeAdapter.isSupported()) {
      this._window = await NodeAdapter.createWindow();
    } else {
      throw new Error(`Unsupported environment: ${this._environment}`);
    }

    this._initialized = true;
  }

  public async getDOMParser(): Promise<DOMParserInterface> {
    await this.ensureInitialized();
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return new this._window.DOMParser();
  }

  public async getDocument(): Promise<DocumentInterface> {
    await this.ensureInitialized();
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return this._window.document;
  }

  public async getNodeFilter() {
    await this.ensureInitialized();
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return this._window.NodeFilter;
  }

  public async getNode() {
    await this.ensureInitialized();
    if (!this._window) {
      throw new Error('DOM environment not properly initialized');
    }
    return this._window.Node || NODE_TYPES;
  }

  /**
   * Parse HTML string to Document
   */
  public async parseHTML(html: string): Promise<Document> {
    const parser = await this.getDOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  /**
   * Check if jsdom is available and properly loaded
   */
  public async hasJSDOM(): Promise<boolean> {
    if (!this.isNode) return false;
    return await NodeAdapter.hasJSDOM();
  }

  /**
   * Get environment information
   */
  public async getEnvironmentInfo() {
    return {
      environment: this._environment,
      isNode: this.isNode,
      isBrowser: this.isBrowser,
      isWebWorker: this.isWebWorker,
      hasJSDOM: await this.hasJSDOM(),
      hasNativeDOM: this.isBrowser && EnvironmentDetector.detectDocument()
    };
  }
}

// Export singleton instance
export const domAdapter = DOMAdapter.getInstance();

// Export convenience functions - now async due to dynamic loading
export const parseHTML = async (html: string) => await domAdapter.parseHTML(html);
export const getDOMParser = async () => await domAdapter.getDOMParser();
export const getDocument = async () => await domAdapter.getDocument();
export const getNodeFilter = async () => await domAdapter.getNodeFilter();
export const getNode = async () => await domAdapter.getNode();
export const isNode = () => domAdapter.isNode;
export const isBrowser = () => domAdapter.isBrowser; 