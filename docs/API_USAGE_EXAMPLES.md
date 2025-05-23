# HTML Content Processor - API Usage Examples

This document provides comprehensive examples of how to use the new HTML Content Processor API (v1.0.3).

## Table of Contents

1. [Basic Usage](#basic-usage)
2. [Fluent API (Recommended)](#fluent-api-recommended)
3. [Convenience Functions](#convenience-functions)
4. [Presets](#presets)
5. [Plugin System](#plugin-system)
6. [Advanced Configuration](#advanced-configuration)
7. [Legacy API Support](#legacy-api-support)
8. [TypeScript Usage](#typescript-usage)

## Basic Usage

### Simple HTML to Markdown Conversion

```javascript
import { htmlToMarkdown } from 'html-content-processor';

const html = '<h1>Title</h1><p>This is a paragraph with <a href="https://example.com">a link</a>.</p>';
const markdown = htmlToMarkdown(html);
console.log(markdown);
// Output: # Title\n\nThis is a paragraph with [a link](https://example.com).
```

### Clean HTML Content

```javascript
import { cleanHtml } from 'html-content-processor';

const dirtyHtml = '<div><h1>Title</h1><p>Content</p><nav>Navigation</nav><footer>Footer</footer></div>';
const cleanedHtml = cleanHtml(dirtyHtml);
console.log(cleanedHtml);
// Output: <h1>Title</h1><p>Content</p> (nav and footer removed)
```

## Fluent API (Recommended)

The fluent API provides the most flexibility and control over the processing pipeline.

### Basic Chaining

```javascript
import { HtmlProcessor } from 'html-content-processor';

const result = HtmlProcessor
  .from(html)
  .filter({ threshold: 3 })
  .withBaseUrl('https://example.com')
  .toMarkdown({ citations: true });

console.log(result.content);
console.log(result.references);
```

### Advanced Processing

```javascript
import { HtmlProcessor } from 'html-content-processor';

const processor = HtmlProcessor.from(complexHtml)
  .withBaseUrl('https://news.example.com')
  .withOptions({
    filter: {
      threshold: 3,
      strategy: 'dynamic',
      removeElements: ['nav', 'aside', '.ads', '.social-share']
    },
    converter: {
      citations: true,
      format: 'github',
      linkStyle: 'reference'
    }
  })
  .filter();

// Get different output formats
const markdown = processor.toMarkdown();
const plainText = processor.toText();
const htmlFragments = processor.toArray();
const cleanHtml = processor.toString();

// Get detailed metadata
const filterResult = processor.getFilterResult();
console.log(`Reduction: ${filterResult.metadata.reductionPercent}%`);
console.log(`Processing time: ${markdown.metadata.processingTime}ms`);
```

## Convenience Functions

### One-Step Conversions

```javascript
import { 
  htmlToMarkdown, 
  htmlToText, 
  extractContent,
  htmlToMarkdownWithCitations 
} from 'html-content-processor';

// Basic conversion
const markdown = htmlToMarkdown(html);

// With custom options
const markdown2 = htmlToMarkdown(html, {
  baseUrl: 'https://example.com',
  threshold: 3,
  citations: true,
  ignoreImages: false
});

// Extract main content as fragments
const fragments = extractContent(html, { threshold: 2 });

// Convert to plain text
const text = htmlToText(html);

// Get markdown with citations
const withCitations = htmlToMarkdownWithCitations(html, 'https://example.com');
```

### Creating Reusable Processors

```javascript
import { createProcessor } from 'html-content-processor';

// Create a configured processor
const articleProcessor = createProcessor({
  preset: 'article',
  baseUrl: 'https://myblog.com'
});

// Use it multiple times
const articles = htmlArray.map(html => 
  articleProcessor.filter(html).toMarkdown().content
);
```

## Presets

### Using Built-in Presets

```javascript
import { 
  htmlToArticleMarkdown,
  htmlToBlogMarkdown,
  htmlToNewsMarkdown,
  strictCleanHtml,
  gentleCleanHtml
} from 'html-content-processor';

// Optimized for long-form articles
const articleMd = htmlToArticleMarkdown(html, 'https://example.com');

// Optimized for blog posts
const blogMd = htmlToBlogMarkdown(html, 'https://blog.example.com');

// Optimized for news articles
const newsMd = htmlToNewsMarkdown(html, 'https://news.example.com');

// Aggressive cleaning
const strictHtml = strictCleanHtml(html);

// Gentle cleaning
const gentleHtml = gentleCleanHtml(html);
```

### Working with Presets

```javascript
import { getPreset, mergeWithPreset, presets } from 'html-content-processor';

// Get a preset configuration
const articlePreset = getPreset('article');
console.log(articlePreset);

// Merge with custom options
const customConfig = mergeWithPreset('article', {
  filter: { threshold: 4 },
  converter: { citations: false }
});

// List all available presets
console.log(Object.keys(presets));
// Output: ['default', 'article', 'blog', 'news', 'strict', 'loose']
```

### Using Presets with HtmlProcessor

```javascript
import { HtmlProcessor } from 'html-content-processor';

// Use preset directly
const processor = new HtmlProcessor({ preset: 'article' });

// Override preset options
const customProcessor = HtmlProcessor.from(html, {
  preset: 'blog',
  filter: { threshold: 4 },  // Override blog preset threshold
  baseUrl: 'https://custom.com'
});
```

## Plugin System

### Using Built-in Plugins

```javascript
import { useBuiltinPlugins, usePlugin, builtinPlugins } from 'html-content-processor';

// Register all built-in plugins
useBuiltinPlugins();

// Or register individual plugins
usePlugin(builtinPlugins.adRemover);
usePlugin(builtinPlugins.socialRemover);
usePlugin(builtinPlugins.markdownCleaner);
```

### Creating Custom Plugins

```javascript
import { usePlugin } from 'html-content-processor';

// Simple filter plugin
const customAdRemover = {
  name: 'custom-ad-remover',
  version: '1.0.3',
  description: 'Removes custom advertisement patterns',
  filter: (html, context) => {
    return html.replace(/<div class="my-ads">.*?<\/div>/gi, '');
  }
};

// Markdown processing plugin
const linkProcessor = {
  name: 'link-processor',
  version: '1.0.3',
  description: 'Processes links in markdown',
  convert: (markdown, context) => {
    // Add target="_blank" to external links in HTML representation
    return markdown.replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
      '[$1]($2 "External Link")'
    );
  }
};

// Register plugins
usePlugin(customAdRemover);
usePlugin(linkProcessor);

// Now all processing will use these plugins
const result = htmlToMarkdown(html);
```

### Plugin Management

```javascript
import { 
  getAllPlugins, 
  getPlugin, 
  removePlugin, 
  clearPlugins,
  getPluginStats 
} from 'html-content-processor';

// Get all registered plugins
const plugins = getAllPlugins();
console.log(plugins.map(p => `${p.name} v${p.version}`));

// Get specific plugin
const adRemover = getPlugin('ad-remover');

// Remove plugin
removePlugin('ad-remover');

// Clear all plugins
clearPlugins();

// Get statistics
const stats = getPluginStats();
console.log(`Total plugins: ${stats.total}`);
console.log(`Plugins with filter: ${stats.withFilter}`);
```

## Advanced Configuration

### Custom Filter Options

```javascript
import { HtmlProcessor } from 'html-content-processor';

const processor = HtmlProcessor.from(html, {
  filter: {
    threshold: 3,
    strategy: 'dynamic',
    ratio: 0.55,
    minWords: 10,
    preserveStructure: true,
    removeElements: [
      'nav', 'aside', 'footer', 'header',
      '.ads', '.advertisement', '.social-share'
    ],
    keepElements: [
      'article', 'main', 'section', 'p', 'h1', 'h2', 'h3'
    ]
  }
});
```

### Custom Converter Options

```javascript
import { HtmlProcessor } from 'html-content-processor';

const processor = HtmlProcessor.from(html, {
  converter: {
    citations: true,
    ignoreLinks: false,
    ignoreImages: false,
    format: 'github',
    linkStyle: 'reference',
    escapeSpecialChars: true
  }
});
```

### Dynamic Configuration

```javascript
import { HtmlProcessor } from 'html-content-processor';

const processor = HtmlProcessor.from(html);

// Apply different filters based on content type
if (isArticle(html)) {
  processor.withOptions({ preset: 'article' });
} else if (isBlogPost(html)) {
  processor.withOptions({ preset: 'blog' });
}

// Apply filtering
processor.filter();

// Convert with different options based on output target
if (needsCitations) {
  return processor.toMarkdown({ citations: true });
} else {
  return processor.toMarkdown({ citations: false });
}
```

## Legacy API Support

The library maintains backward compatibility with the original API:

```javascript
// Legacy imports still work
import { 
  filterHtmlToArray, 
  filterHtmlToString,
  htmlToMarkdownLegacy,
  debugFilterComparison 
} from 'html-content-processor';

// Or access via default export
import htmlFilter from 'html-content-processor';

const filtered = htmlFilter.filterHtmlToString(html);
const markdown = htmlFilter.htmlToMarkdown(html);

// Legacy API is also available under .legacy namespace
const legacyResult = htmlFilter.legacy.htmlToMarkdown(html);
```

## TypeScript Usage

The library is fully typed for excellent TypeScript support:

```typescript
import { 
  HtmlProcessor, 
  ProcessorOptions, 
  MarkdownResult,
  FilterOptions,
  Plugin 
} from 'html-content-processor';

// Fully typed configuration
const options: ProcessorOptions = {
  preset: 'article',
  filter: {
    threshold: 3,
    strategy: 'dynamic',
    removeElements: ['nav', 'aside']
  },
  converter: {
    citations: true,
    format: 'github'
  }
};

// Type-safe processing
const processor = new HtmlProcessor(options);
const result: MarkdownResult = processor.filter().toMarkdown();

// Custom plugin with proper typing
const myPlugin: Plugin = {
  name: 'my-plugin',
  version: '1.0.3',
  filter: (html: string, context) => {
    // TypeScript will provide proper intellisense here
    return html.replace(/unwanted/g, '');
  }
};
```

## Error Handling

The new API includes proper error handling:

```javascript
import { FilterError, ConversionError, PluginError } from 'html-content-processor';

try {
  const result = HtmlProcessor
    .from(html)
    .filter()
    .toMarkdown();
} catch (error) {
  if (error instanceof FilterError) {
    console.error('Filtering failed:', error.message);
  } else if (error instanceof ConversionError) {
    console.error('Conversion failed:', error.message);
  } else if (error instanceof PluginError) {
    console.error('Plugin error:', error.message, 'Plugin:', error.pluginName);
  }
}
```

## Migration from Legacy API

If you're migrating from the legacy API, here's a quick reference:

```javascript
// OLD (Legacy API)
import htmlFilter from 'html-content-processor';
const filtered = htmlFilter.filterHtmlToString(html);
const markdown = htmlFilter.htmlToMarkdown(html);

// NEW (Recommended API)
import { HtmlProcessor } from 'html-content-processor';
const filtered = HtmlProcessor.from(html).filter().toString();
const markdown = HtmlProcessor.from(html).filter().toMarkdown().content;

// Or using convenience functions
import { cleanHtml, htmlToMarkdown } from 'html-content-processor';
const filtered = cleanHtml(html);
const markdown = htmlToMarkdown(html);
```

The new API provides much more flexibility, better error handling, TypeScript support, and extensibility through plugins and presets. 
