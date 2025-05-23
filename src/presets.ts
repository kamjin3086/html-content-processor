import { ProcessorOptions, PresetName } from './types';

/**
 * Predefined preset configurations for common use cases
 */
export const presets: Record<PresetName, ProcessorOptions> = {
  /**
   * Default configuration - balanced filtering and conversion
   */
  default: {
    filter: {
      threshold: 2,
      strategy: 'dynamic',
      ratio: 0.48,
      minWords: 0,
      preserveStructure: false
    },
    converter: {
      citations: true,
      ignoreLinks: false,
      ignoreImages: false,
      format: 'github',
      linkStyle: 'inline',
      escapeSpecialChars: false
    }
  },

  /**
   * Article configuration - optimized for long-form content
   */
  article: {
    filter: {
      threshold: 3,
      strategy: 'dynamic',
      ratio: 0.55,
      minWords: 10,
      preserveStructure: true,
      removeElements: ['nav', 'aside', 'footer', '.ads', '.advertisement', '.sidebar']
    },
    converter: {
      citations: true,
      ignoreLinks: false,
      ignoreImages: false,
      format: 'github',
      linkStyle: 'reference',
      escapeSpecialChars: false
    }
  },

  /**
   * Blog configuration - optimized for blog posts
   */
  blog: {
    filter: {
      threshold: 2,
      strategy: 'dynamic',
      ratio: 0.50,
      minWords: 5,
      preserveStructure: true,
      removeElements: ['nav', 'aside', '.comments', '.social-share', '.ads']
    },
    converter: {
      citations: false,
      ignoreLinks: false,
      ignoreImages: false,
      format: 'github',
      linkStyle: 'inline',
      escapeSpecialChars: false
    }
  },

  /**
   * News configuration - optimized for news articles
   */
  news: {
    filter: {
      threshold: 2,
      strategy: 'fixed',
      ratio: 0.45,
      minWords: 15,
      preserveStructure: true,
      removeElements: [
        'nav', 'aside', 'footer', '.ads', '.advertisement', 
        '.related-articles', '.social-share', '.comments'
      ]
    },
    converter: {
      citations: true,
      ignoreLinks: false,
      ignoreImages: false,
      format: 'commonmark',
      linkStyle: 'reference',
      escapeSpecialChars: true
    }
  },

  /**
   * Strict configuration - aggressive filtering and clean output
   */
  strict: {
    filter: {
      threshold: 4,
      strategy: 'fixed',
      ratio: 0.60,
      minWords: 20,
      preserveStructure: false,
      removeElements: [
        'nav', 'aside', 'footer', 'header', '.ads', '.advertisement',
        '.sidebar', '.comments', '.social-share', '.related', 'script', 'style'
      ],
      keepElements: ['article', 'main', 'section', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    },
    converter: {
      citations: false,
      ignoreLinks: true,
      ignoreImages: true,
      format: 'commonmark',
      linkStyle: 'reference',
      escapeSpecialChars: true
    }
  },

  /**
   * Loose configuration - minimal filtering, preserve most content
   */
  loose: {
    filter: {
      threshold: 1,
      strategy: 'dynamic',
      ratio: 0.30,
      minWords: 0,
      preserveStructure: true,
      removeElements: ['script', 'style', 'noscript']
    },
    converter: {
      citations: true,
      ignoreLinks: false,
      ignoreImages: false,
      format: 'github',
      linkStyle: 'inline',
      escapeSpecialChars: false
    }
  }
};

/**
 * Get a preset configuration by name
 * @param name Preset name
 * @returns Preset configuration options
 */
export function getPreset(name: PresetName): ProcessorOptions {
  const preset = presets[name];
  if (!preset) {
    throw new Error(`Unknown preset: ${name}`);
  }
  return JSON.parse(JSON.stringify(preset)); // Deep clone to prevent mutations
}

/**
 * Get all available preset names
 * @returns Array of preset names
 */
export function getPresetNames(): PresetName[] {
  return Object.keys(presets) as PresetName[];
}

/**
 * Check if a preset exists
 * @param name Preset name to check
 * @returns True if preset exists
 */
export function hasPreset(name: string): name is PresetName {
  return name in presets;
}

/**
 * Merge custom options with a preset
 * @param presetName Preset to use as base
 * @param customOptions Custom options to merge
 * @returns Merged configuration
 */
export function mergeWithPreset(
  presetName: PresetName, 
  customOptions: Partial<ProcessorOptions>
): ProcessorOptions {
  const preset = getPreset(presetName);
  
  return {
    ...preset,
    ...customOptions,
    filter: {
      ...preset.filter,
      ...customOptions.filter
    },
    converter: {
      ...preset.converter,
      ...customOptions.converter
    }
  };
} 