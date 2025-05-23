import { Plugin, PluginContext, PluginError } from './types';
import { VERSION } from './version';

/**
 * Global plugin registry
 */
class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map();
  private initializationOrder: string[] = [];

  /**
   * Register a new plugin
   * @param plugin Plugin to register
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.name)) {
      throw new PluginError(
        `Plugin with name "${plugin.name}" is already registered`,
        plugin.name
      );
    }

    try {
      // Initialize plugin if it has an init function
      if (plugin.init) {
        plugin.init();
      }

      this.plugins.set(plugin.name, plugin);
      this.initializationOrder.push(plugin.name);

      console.log(`[PluginManager] Registered plugin: ${plugin.name}${plugin.version ? ` v${plugin.version}` : ''}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new PluginError(
        `Failed to initialize plugin "${plugin.name}": ${errorMessage}`,
        plugin.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Unregister a plugin
   * @param name Plugin name to unregister
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new PluginError(`Plugin "${name}" is not registered`, name);
    }

    try {
      // Call destroy function if it exists
      if (plugin.destroy) {
        plugin.destroy();
      }

      this.plugins.delete(name);
      const index = this.initializationOrder.indexOf(name);
      if (index > -1) {
        this.initializationOrder.splice(index, 1);
      }

      console.log(`[PluginManager] Unregistered plugin: ${name}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new PluginError(
        `Failed to destroy plugin "${name}": ${errorMessage}`,
        name,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Get a registered plugin
   * @param name Plugin name
   * @returns Plugin instance or undefined
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name);
  }

  /**
   * Check if a plugin is registered
   * @param name Plugin name
   * @returns True if plugin is registered
   */
  has(name: string): boolean {
    return this.plugins.has(name);
  }

  /**
   * Get all registered plugins
   * @returns Array of all plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get all plugin names in registration order
   * @returns Array of plugin names
   */
  getNames(): string[] {
    return [...this.initializationOrder];
  }

  /**
   * Apply filter plugins to HTML content
   * @param html HTML content to process
   * @param context Plugin context
   * @returns Processed HTML content
   */
  applyFilterPlugins(html: string, context: PluginContext): string {
    let result = html;

    for (const name of this.initializationOrder) {
      const plugin = this.plugins.get(name);
      if (plugin && plugin.filter) {
        try {
          const processed = plugin.filter(result, context);
          if (typeof processed === 'string') {
            result = processed;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`[PluginManager] Filter plugin "${name}" failed:`, errorMessage);
          // Continue with other plugins instead of throwing
        }
      }
    }

    return result;
  }

  /**
   * Apply conversion plugins to Markdown content
   * @param markdown Markdown content to process
   * @param context Plugin context
   * @returns Processed Markdown content
   */
  applyConvertPlugins(markdown: string, context: PluginContext): string {
    let result = markdown;

    for (const name of this.initializationOrder) {
      const plugin = this.plugins.get(name);
      if (plugin && plugin.convert) {
        try {
          const processed = plugin.convert(result, context);
          if (typeof processed === 'string') {
            result = processed;
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn(`[PluginManager] Convert plugin "${name}" failed:`, errorMessage);
          // Continue with other plugins instead of throwing
        }
      }
    }

    return result;
  }

  /**
   * Clear all plugins
   */
  clear(): void {
    // Destroy all plugins first
    for (const name of [...this.initializationOrder].reverse()) {
      try {
        this.unregister(name);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.warn(`[PluginManager] Failed to unregister plugin "${name}" during clear:`, errorMessage);
      }
    }

    this.plugins.clear();
    this.initializationOrder.length = 0;
  }

  /**
   * Get registry statistics
   * @returns Registry statistics
   */
  getStats() {
    const plugins = this.getAll();
    return {
      total: plugins.length,
      withFilter: plugins.filter(p => typeof p.filter === 'function').length,
      withConvert: plugins.filter(p => typeof p.convert === 'function').length,
      withInit: plugins.filter(p => typeof p.init === 'function').length,
      withDestroy: plugins.filter(p => typeof p.destroy === 'function').length
    };
  }
}

// Global plugin registry instance
const globalRegistry = new PluginRegistry();

/**
 * Register a plugin globally
 * @param plugin Plugin to register
 */
export function usePlugin(plugin: Plugin): void {
  globalRegistry.register(plugin);
}

/**
 * Unregister a plugin globally
 * @param name Plugin name to unregister
 */
export function removePlugin(name: string): void {
  globalRegistry.unregister(name);
}

/**
 * Get a registered plugin
 * @param name Plugin name
 * @returns Plugin instance or undefined
 */
export function getPlugin(name: string): Plugin | undefined {
  return globalRegistry.get(name);
}

/**
 * Check if a plugin is registered
 * @param name Plugin name
 * @returns True if plugin is registered
 */
export function hasPlugin(name: string): boolean {
  return globalRegistry.has(name);
}

/**
 * Get all registered plugins
 * @returns Array of all plugins
 */
export function getAllPlugins(): Plugin[] {
  return globalRegistry.getAll();
}

/**
 * Get all plugin names
 * @returns Array of plugin names
 */
export function getPluginNames(): string[] {
  return globalRegistry.getNames();
}

/**
 * Clear all plugins
 */
export function clearPlugins(): void {
  globalRegistry.clear();
}

/**
 * Get plugin registry statistics
 * @returns Registry statistics
 */
export function getPluginStats() {
  return globalRegistry.getStats();
}

/**
 * Export the registry for internal use
 * @internal
 */
export { globalRegistry as pluginRegistry };

/**
 * Built-in plugins for common use cases
 */
export const builtinPlugins = {
  /**
   * Plugin to remove advertisement elements
   */
  adRemover: {
    name: 'ad-remover',
    version: VERSION,
    description: 'Removes advertisement elements from HTML',
    filter: (html: string) => {
      return html.replace(
        /<[^>]*class[^>]*(?:ad|advertisement|banner|sponsored)[^>]*>.*?<\/[^>]+>/gi,
        ''
      );
    }
  } as Plugin,

  /**
   * Plugin to remove social media widgets
   */
  socialRemover: {
    name: 'social-remover',
    version: VERSION,
    description: 'Removes social media widgets and share buttons',
    filter: (html: string) => {
      return html.replace(
        /<[^>]*class[^>]*(?:social|share|tweet|facebook|twitter|linkedin)[^>]*>.*?<\/[^>]+>/gi,
        ''
      );
    }
  } as Plugin,

  /**
   * Plugin to clean up Markdown formatting
   */
  markdownCleaner: {
    name: 'markdown-cleaner',
    version: VERSION,
    description: 'Cleans up redundant Markdown formatting',
    convert: (markdown: string) => {
      return markdown
        .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
        .replace(/[ \t]+$/gm, '')   // Remove trailing whitespace
        .trim();
    }
  } as Plugin
};

/**
 * Register all built-in plugins
 */
export function useBuiltinPlugins(): void {
  Object.values(builtinPlugins).forEach(plugin => {
    try {
      usePlugin(plugin);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.warn(`[PluginManager] Failed to register built-in plugin "${plugin.name}":`, errorMessage);
    }
  });
} 