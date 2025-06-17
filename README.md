# HTML Content Processor

<p align="left">
English | <a href="README.zh-CN.md">简体中文</a>
</p>

A modern TypeScript library for cleaning, filtering, and converting HTML content to Markdown with intelligent content extraction. Supports cross-environment execution (Browser/Node.js) with automatic page type detection.

## Features

- 🚀 **Modern API Design** - Clean functional and class-based APIs
- 🧠 **Intelligent Filtering** - Automatic page type detection with optimal filtering strategies
- 📝 **High-Quality Markdown Conversion** - Advanced HTML to Markdown transformation
- 🌐 **Cross-Environment Support** - Full compatibility with both browser and Node.js environments
- 🎯 **Smart Presets** - Optimized configurations for different content types
- 🔌 **Plugin System** - Extensible plugin architecture
- 📊 **Automatic Detection** - Smart detection of search engines, blogs, news, documentation, and more

## Installation

```bash
npm install html-content-processor
```

## Quick Start

### Basic Usage

```typescript
import { htmlToMarkdown, htmlToText, cleanHtml } from 'html-content-processor';

// Convert HTML to Markdown
const markdown = await htmlToMarkdown('<h1>Hello</h1><p>World</p>');

// Convert HTML to plain text
const text = await htmlToText('<h1>Hello</h1><p>World</p>');

// Clean HTML content
const clean = await cleanHtml('<div>Content</div><script>ads</script>');
```

### Automatic Page Type Detection (Recommended)

The library can automatically detect page types and apply optimal filtering strategies:

```typescript
import { htmlToMarkdownAuto, cleanHtmlAuto, extractContentAuto } from 'html-content-processor';

// Automatic detection with URL context
const markdown = await htmlToMarkdownAuto(html, 'https://example.com/blog-post');

// Clean HTML with automatic page type detection
const cleanHtml = await cleanHtmlAuto(html, 'https://news.example.com/article');

// Extract content with detailed page type information
const result = await extractContentAuto(html, 'https://docs.example.com/guide');
console.log('Detected page type:', result.pageType.type);
console.log('Confidence:', result.pageType.confidence);
console.log('Markdown:', result.markdown.content);
```

### HtmlProcessor Class (Advanced Usage)

```typescript
import { HtmlProcessor } from 'html-content-processor';

// Method chaining
const result = await HtmlProcessor
  .from(html)
  .withBaseUrl('https://example.com')
  .withAutoDetection() // Enable automatic page type detection
  .filter()
  .toMarkdown();

// Manual page type setting
const processor = await HtmlProcessor
  .from(html)
  .withPageType('blog') // Manually set page type
  .filter();

const markdown = await processor.toMarkdown();
```

### Content-Specific Presets

```typescript
import { 
  htmlToArticleMarkdown, 
  htmlToBlogMarkdown, 
  htmlToNewsMarkdown 
} from 'html-content-processor';

// Optimized for different content types
const articleMd = await htmlToArticleMarkdown(html, baseUrl);
const blogMd = await htmlToBlogMarkdown(html, baseUrl);
const newsMd = await htmlToNewsMarkdown(html, baseUrl);
```

## API Reference

### Core Functions

| Function | Description | Return Type |
|----------|-------------|-------------|
| `htmlToMarkdown(html, options?)` | Convert HTML to Markdown | `Promise<string>` |
| `htmlToMarkdownWithCitations(html, baseUrl?, options?)` | Convert HTML to Markdown with citations | `Promise<string>` |
| `htmlToText(html, options?)` | Convert HTML to plain text | `Promise<string>` |
| `cleanHtml(html, options?)` | Clean HTML content | `Promise<string>` |
| `extractContent(html, options?)` | Extract content fragments | `Promise<string[]>` |

### Automatic Detection Functions

| Function | Description | Benefits |
|----------|-------------|----------|
| `htmlToMarkdownAuto(html, url?, options?)` | Auto-detect page type and convert to Markdown | Optimal filtering for each page type |
| `cleanHtmlAuto(html, url?, options?)` | Auto-detect page type and clean HTML | Smart noise removal |
| `extractContentAuto(html, url?, options?)` | Auto-detect and extract with detailed results | Comprehensive page analysis |

#### Example: Using Auto-Detection

```typescript
// Blog post detection
const blogResult = await htmlToMarkdownAuto(html, 'https://medium.com/@user/post');
// Automatically applies blog-optimized filtering

// News article detection  
const newsResult = await htmlToMarkdownAuto(html, 'https://cnn.com/article');
// Automatically applies news-optimized filtering

// Documentation detection
const docsResult = await htmlToMarkdownAuto(html, 'https://docs.react.dev/guide');
// Automatically applies documentation-optimized filtering

// Search engine results detection
const searchResult = await htmlToMarkdownAuto(html, 'https://google.com/search?q=query');
// Automatically applies search-results-optimized filtering
```

### Content-Specific Presets

| Function | Optimized For |
|----------|---------------|
| `htmlToArticleMarkdown()` | Long-form articles |
| `htmlToBlogMarkdown()` | Blog posts |
| `htmlToNewsMarkdown()` | News articles |
| `strictCleanHtml()` | Aggressive cleaning |
| `gentleCleanHtml()` | Conservative cleaning |

### HtmlProcessor Class

```typescript
// Create processor
const processor = HtmlProcessor.from(html, options);

// Configuration methods
processor.withBaseUrl(url)           // Set base URL
processor.withOptions(options)       // Update options
processor.withAutoDetection(url?)    // Enable auto-detection
processor.withPageType(type)         // Manually set page type

// Processing methods
await processor.filter(options?)     // Apply filtering
await processor.toMarkdown(options?) // Convert to Markdown
await processor.toText()             // Convert to plain text
await processor.toArray()            // Convert to fragment array
processor.toString()                 // Get cleaned HTML

// Information methods
processor.getOptions()               // Get current options
processor.isProcessed()              // Check if processed
processor.getPageTypeResult()        // Get page type detection result
```

## Configuration Options

### Filter Options (FilterOptions)

```typescript
{
  threshold?: number;           // Filtering threshold (default: 2)
  strategy?: 'fixed' | 'dynamic'; // Filtering strategy (default: 'dynamic')
  ratio?: number;              // Text density ratio (default: 0.48)
  minWords?: number;           // Minimum word count (default: 0)
  preserveStructure?: boolean; // Preserve structure (default: false)
  keepElements?: string[];     // Elements to keep
  removeElements?: string[];   // Elements to remove
}
```

### Convert Options (ConvertOptions)

```typescript
{
  citations?: boolean;         // Generate citations (default: true)
  ignoreLinks?: boolean;       // Ignore links (default: false)
  ignoreImages?: boolean;      // Ignore images (default: false)
  baseUrl?: string;           // Base URL
  threshold?: number;         // Filter threshold
  strategy?: 'fixed' | 'dynamic'; // Filter strategy
  ratio?: number;             // Text density ratio
}
```

## Automatic Page Type Detection

The library automatically detects and optimizes for these page types:

- `search-engine` - Search engine result pages
- `blog` - Blog posts and personal articles
- `news` - News articles and journalism
- `documentation` - Technical documentation
- `e-commerce` - E-commerce and product pages
- `social-media` - Social media content
- `forum` - Forum discussions and Q&A
- `article` - General articles and content
- `landing-page` - Marketing and landing pages

### How Auto-Detection Works

```typescript
import { extractContentAuto } from 'html-content-processor';

const result = await extractContentAuto(html, url);

console.log('Page Type:', result.pageType.type);
console.log('Confidence:', (result.pageType.confidence * 100).toFixed(1) + '%');
console.log('Detection Reasons:', result.pageType.reasons);
console.log('Applied Filter Options:', result.pageType.filterOptions);
```

## Environment Support

### Node.js
```bash
npm install jsdom  # Recommended for best performance
```

### Browser
Direct support, no additional dependencies required.

### CDN
```html
<script src="https://unpkg.com/html-content-processor"></script>
<script>
  // Global variable: window.htmlFilter
  htmlFilter.htmlToMarkdown(html).then(console.log);
  
  // Auto-detection example
  htmlFilter.htmlToMarkdownAuto(html, window.location.href).then(result => {
    console.log('Auto-detected content:', result);
  });
</script>
```

## Real-World Examples

### Web Scraping with Auto-Detection

```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// Scrape and convert blog post
const response = await fetch('https://blog.example.com/post-123');
const html = await response.text();
const markdown = await htmlToMarkdownAuto(html, response.url);
// Automatically detects it's a blog and applies blog-specific filtering
```

### News Article Processing

```typescript
import { extractContentAuto } from 'html-content-processor';

const result = await extractContentAuto(newsHtml, 'https://news.site.com/article');
if (result.pageType.type === 'news') {
  console.log('High-quality news content extracted');
  console.log('Confidence:', result.pageType.confidence);
}
```

### Documentation Conversion

```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// Convert technical documentation
const docMarkdown = await htmlToMarkdownAuto(docsHtml, 'https://docs.example.com/api');
// Automatically preserves code blocks, headers, and technical content structure
```

## Performance

- ⚡ **Fast Processing**: Optimized algorithms for quick content extraction
- 💾 **Memory Efficient**: Minimal memory footprint
- 🔄 **Batch Processing**: Handle multiple documents efficiently
- 📊 **Smart Caching**: Automatic page type detection caching

## License

MIT License
