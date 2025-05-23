# HTML Content Processor

[![npm version](https://badge.fury.io/js/html-content-processor.svg)](https://badge.fury.io/js/html-content-processor)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](#)

A powerful, professional library for intelligent HTML content processing, cleaning, and conversion to Markdown. Extract meaningful content from web pages while filtering out noise like ads, navigation, and boilerplate text.

## ✨ Features

- 🧠 **Intelligent Content Extraction** - Smart algorithm to identify and extract main content
- 🧹 **Advanced HTML Cleaning** - Remove ads, navigation, sidebars, and other noise
- 📝 **Multiple Output Formats** - Markdown, plain text, cleaned HTML, or structured fragments
- 🎯 **Content-Aware Presets** - Optimized configurations for articles, blogs, news, and more
- 🔌 **Plugin System** - Extensible architecture with built-in and custom plugins
- 🌊 **Fluent API** - Chainable, intuitive interface for complex processing pipelines
- 📚 **TypeScript Support** - Full type definitions for enhanced development experience
- ⚡ **High Performance** - Efficient processing with minimal overhead
- 🎛️ **Highly Configurable** - Fine-tune extraction algorithms to your needs

## 🚀 Quick Start

### Installation

```bash
npm install html-content-processor
```

### Basic Usage

```javascript
import { htmlToMarkdown, cleanHtml, HtmlProcessor } from 'html-content-processor';

// Simple HTML to Markdown conversion
const markdown = htmlToMarkdown('<h1>Title</h1><p>Content with <a href="#">link</a></p>');
console.log(markdown);
// Output: # Title\n\nContent with [link](#)

// Clean HTML (remove noise)
const cleanedHtml = cleanHtml(dirtyHtml);

// Advanced processing with fluent API
const result = HtmlProcessor
  .from(complexHtml)
  .withBaseUrl('https://example.com')
  .filter({ threshold: 3 })
  .toMarkdown({ citations: true });

console.log(result.content);    // Main content
console.log(result.references); // Citation links
```

## 📖 Documentation

### Content Extraction Presets

Choose from optimized presets for different content types:

```javascript
import { 
  htmlToArticleMarkdown,   // Long-form articles
  htmlToBlogMarkdown,      // Blog posts  
  htmlToNewsMarkdown,      // News articles
  strictCleanHtml,         // Aggressive cleaning
  gentleCleanHtml          // Conservative cleaning
} from 'html-content-processor';

const articleMarkdown = htmlToArticleMarkdown(html, 'https://example.com');
```

### Fluent API (Recommended)

The fluent API provides maximum flexibility and control:

```javascript
import { HtmlProcessor } from 'html-content-processor';

const processor = HtmlProcessor
  .from(html)
  .withBaseUrl('https://news.site.com')
  .withOptions({
    filter: {
      threshold: 3,
      strategy: 'dynamic',
      removeElements: ['nav', 'aside', '.ads']
    },
    converter: {
      citations: true,
      format: 'github'
    }
  })
  .filter();

// Multiple output formats from same processor
const markdown = processor.toMarkdown();
const plainText = processor.toText();
const fragments = processor.toArray();
const cleanHtml = processor.toString();
```

### Plugin System

Extend functionality with plugins:

```javascript
import { usePlugin, useBuiltinPlugins } from 'html-content-processor';

// Use built-in plugins
useBuiltinPlugins(); // Includes ad-remover, social-remover, markdown-cleaner

// Create custom plugin
const myPlugin = {
  name: 'custom-filter',
  version: '1.0.0',
  filter: (html, context) => {
    return html.replace(/unwanted-pattern/g, '');
  }
};

usePlugin(myPlugin);
```

## 🔧 Configuration Options

### Filter Options

```javascript
const options = {
  filter: {
    threshold: 3,                    // Minimum word count
    strategy: 'dynamic',             // 'fixed' or 'dynamic'
    ratio: 0.55,                     // Text-to-HTML ratio threshold
    minWords: 10,                    // Minimum words per element
    removeElements: ['nav', 'aside'], // Elements to remove
    keepElements: ['article', 'main'] // Elements to preserve
  }
};
```

### Converter Options

```javascript
const options = {
  converter: {
    citations: true,              // Include link references
    ignoreLinks: false,           // Skip link conversion
    ignoreImages: false,          // Skip image conversion
    format: 'github',             // Markdown flavor
    linkStyle: 'reference'        // 'inline' or 'reference'
  }
};
```

## 📊 Example Use Cases

### Web Scraping & Content Extraction

```javascript
// Extract clean content from scraped web pages
const article = await fetch('https://news.site.com/article')
  .then(res => res.text())
  .then(html => htmlToArticleMarkdown(html, 'https://news.site.com'));
```

### CMS Content Processing

```javascript
// Process user-generated HTML content
const processor = HtmlProcessor.from(userHtml)
  .withOptions({ preset: 'strict' });  // Remove all potentially harmful content

const safeContent = processor.filter().toString();
```

### Documentation Generation

```javascript
// Convert HTML documentation to Markdown
const docs = HtmlProcessor.from(htmlDocs)
  .filter({ preserveStructure: true })
  .toMarkdown({ 
    citations: true,
    format: 'github' 
  });
```

## 🎯 Advanced Features

### Metadata & Analytics

```javascript
const result = HtmlProcessor.from(html).filter().toMarkdown();

console.log(result.metadata);
// {
//   originalLength: 15420,
//   filteredLength: 8932,
//   reductionPercent: 42.1,
//   processingTime: 23,
//   elementsRemoved: 156,
//   linksFound: 12
// }
```

### Error Handling

```javascript
import { FilterError, ConversionError } from 'html-content-processor';

try {
  const result = HtmlProcessor.from(invalidHtml).filter().toMarkdown();
} catch (error) {
  if (error instanceof FilterError) {
    console.error('Content filtering failed:', error.message);
  } else if (error instanceof ConversionError) {
    console.error('Markdown conversion failed:', error.message);
  }
}
```

## 🔗 API Reference

### Core Functions

| Function | Description | Return Type |
|----------|-------------|-------------|
| `htmlToMarkdown(html, options?)` | Convert HTML to Markdown | `string` |
| `cleanHtml(html, options?)` | Clean and filter HTML | `string` |
| `extractContent(html, options?)` | Extract content fragments | `string[]` |
| `htmlToText(html, options?)` | Convert to plain text | `string` |

### Classes

| Class | Description |
|-------|-------------|
| `HtmlProcessor` | Main processing class with fluent API |
| `HtmlFilter` | Core content filtering engine |
| `DefaultMarkdownGenerator` | Markdown conversion engine |

[📚 **View Full API Documentation**](./API_USAGE_EXAMPLES.md)

## 🛠️ Development

### Building from Source

```bash
# Clone the repository
git clone https://github.com/kamjin3086/html-content-processor.git
cd html-content-processor

# Install dependencies
npm install

# Build the project
npm run build

# Run development server
npm run dev
```

### Running Tests

```bash
npm test
```

### Demo

Try the interactive demo:

```bash
npm run dev
# Visit http://localhost:9000/demo/
```

## 📈 Performance

HTML Content Processor is designed for high performance:

- ⚡ **Fast Processing**: Optimized algorithms for quick content extraction
- 💾 **Memory Efficient**: Minimal memory footprint, suitable for server environments
- 🔄 **Batch Processing**: Handle multiple documents efficiently
- 📊 **Benchmarks**: Processes typical web pages in < 50ms

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Start for Contributors

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for your changes
5. Run tests: `npm test`
6. Commit: `git commit -m 'Add amazing feature'`
7. Push: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with TypeScript for type safety
- Powered by modern web standards
- Inspired by readability algorithms and content extraction research

## 📞 Support

- 📖 [Documentation](./API_USAGE_EXAMPLES.md)
- 🐛 [Issue Tracker](https://github.com/kamjin3086/html-content-processor/issues)
- 💬 [Discussions](https://github.com/kamjin3086/html-content-processor/discussions)

---

**Made with ❤️ by the HTML Content Processor Team**
