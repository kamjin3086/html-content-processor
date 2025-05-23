# 🤖 Automatic Page Type Detection Guide

The HTML Content Processor now includes intelligent page type detection that automatically optimizes filtering parameters based on the content type. No more manual configuration needed!

## 🎯 Quick Start

### Basic Auto-Detection
```javascript
import { htmlToMarkdownAuto } from 'html-content-processor';

// Automatically detect and process
const result = htmlToMarkdownAuto(html, url);
console.log(result.content);
```

### Full Extraction with Details
```javascript
import { extractContentAuto } from 'html-content-processor';

const { markdown, pageType, cleanHtml } = extractContentAuto(html, url);

console.log(`Detected: ${pageType.type}`);
console.log(`Confidence: ${(pageType.confidence * 100).toFixed(1)}%`);
console.log(`Reasons: ${pageType.reasons.join(', ')}`);
```

### Fluent API
```javascript
import { HtmlProcessor } from 'html-content-processor';

const result = HtmlProcessor.from(html)
  .withAutoDetection(url)
  .filter()
  .toMarkdown();
```

## 📊 Supported Page Types

| Page Type | Optimized For | Key Features |
|-----------|---------------|--------------|
| **search-engine** | Google, Baidu, Bing | High noise removal, link preservation |
| **blog** | WordPress, Medium | Article structure, comment preservation |
| **news** | News sites | Headline focus, timestamp preservation |
| **documentation** | API docs, guides | Code block preservation, TOC structure |
| **e-commerce** | Product pages | Price/review extraction, noise removal |
| **social-media** | Social platforms | Post content, engagement metrics |
| **forum** | Discussion boards | Thread structure, user content |
| **article** | Long-form content | Text density optimization |
| **landing-page** | Marketing pages | CTA preservation, form handling |

## 🔧 Auto-Optimized Parameters

### Search Engine Pages
```javascript
{
  threshold: 8,        // Aggressive filtering
  strategy: 'dynamic', // Adaptive approach
  ratio: 0.2,         // Low text density requirement
  minWords: 1,        // Minimal word requirement
  removeElements: ['script', 'style', 'nav', 'header', 'footer', 'aside', 'form']
}
```

### Blog Posts
```javascript
{
  threshold: 3,        // Moderate filtering
  strategy: 'dynamic',
  ratio: 0.4,         // Higher text density
  minWords: 5,        // Meaningful content
  preserveStructure: true,
  keepElements: ['article', 'main', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote']
}
```

### Documentation
```javascript
{
  threshold: 2,        // Gentle filtering
  strategy: 'fixed',   // Consistent approach
  ratio: 0.3,
  minWords: 3,
  preserveStructure: true,
  keepElements: ['article', 'main', 'section', 'h1-h6', 'p', 'pre', 'code', 'ul', 'ol', 'li']
}
```

## 🎛️ Advanced Usage

### Manual Page Type Override
```javascript
const result = HtmlProcessor.from(html)
  .withPageType('blog')  // Force specific type
  .filter()
  .toMarkdown();
```

### Custom Options with Auto-Detection
```javascript
const result = htmlToMarkdownAuto(html, url, {
  converter: {
    ignoreImages: true,
    citations: false
  },
  debug: true  // See detection details
});
```

### Detection Only (No Processing)
```javascript
import { pageTypeDetector } from 'html-content-processor';

const detection = pageTypeDetector.detectPageType(html, url);
console.log(`Type: ${detection.type}`);
console.log(`Confidence: ${detection.confidence}`);
console.log(`Characteristics:`, detection.characteristics);
```

## 📈 Detection Characteristics

The system analyzes multiple page characteristics:

```javascript
{
  hasSearch: boolean,           // Search functionality
  hasNavigation: boolean,       // Navigation menus
  hasArticleContent: boolean,   // Article structure
  hasProductListings: boolean,  // E-commerce elements
  hasSocialFeatures: boolean,   // Social media features
  hasComments: boolean,         // Comment sections
  hasCodeBlocks: boolean,       // Code examples
  linkDensity: number,         // Link-to-text ratio
  textDensity: number,         // Text-to-HTML ratio
  formCount: number,           // Number of forms
  imageCount: number           // Number of images
}
```

## 🎯 Performance Comparison

| Method | Baidu (626KB) | Processing Time | Accuracy |
|--------|---------------|-----------------|----------|
| Manual Config | 0.6KB (99.9%) | 150ms | Depends on config |
| Auto-Detection | 0.6KB (99.9%) | 310ms | 100% for search engines |
| Full Extraction | 0.6KB (99.9%) | 295ms | Includes type analysis |

## 💡 Best Practices

### 1. Always Provide URL When Available
```javascript
// ✅ Better detection accuracy
const result = htmlToMarkdownAuto(html, 'https://docs.example.com/api');

// ❌ Less accurate without URL context
const result = htmlToMarkdownAuto(html);
```

### 2. Use Debug Mode for Insights
```javascript
const result = htmlToMarkdownAuto(html, url, { debug: true });
// Console will show:
// [HtmlProcessor] Auto-detected page type: documentation (confidence: 95.0%)
// [HtmlProcessor] Detection reasons: Contains code blocks and documentation structure
```

### 3. Fallback for Unknown Types
```javascript
const { pageType } = extractContentAuto(html, url);

if (pageType.confidence < 0.7) {
  console.log('Low confidence detection, consider manual configuration');
  // Use manual settings or default preset
}
```

### 4. Combine with Presets for Edge Cases
```javascript
const result = HtmlProcessor.from(html)
  .withAutoDetection(url)
  .withOptions({ preset: 'strict' })  // Override if needed
  .filter()
  .toMarkdown();
```

## 🔍 Detection Rules

The system uses weighted rules for detection:

1. **URL Analysis** (0.4-0.5 weight)
   - Domain patterns (google.com → search-engine)
   - Path patterns (/docs/ → documentation)

2. **Content Structure** (0.7-0.9 weight)
   - HTML semantic elements
   - Class/ID patterns
   - Element relationships

3. **Text Analysis** (0.6-0.8 weight)
   - Keyword patterns
   - Content density
   - Link patterns

4. **Feature Detection** (0.8-0.9 weight)
   - Search boxes
   - Product listings
   - Code blocks
   - Social features

## 🚀 Migration from Manual Configuration

### Before (Manual)
```javascript
const result = HtmlProcessor.from(html)
  .withOptions({
    filter: {
      threshold: 5,
      strategy: 'dynamic',
      ratio: 0.3,
      minWords: 2
    }
  })
  .filter()
  .toMarkdown();
```

### After (Auto)
```javascript
const result = htmlToMarkdownAuto(html, url);
// Automatically optimized based on page type!
```

## 🎉 Benefits

- **🤖 Zero Configuration**: Works out of the box
- **🎯 Optimized Results**: Each page type gets optimal settings
- **📊 Detailed Insights**: Understand what was detected and why
- **⚡ Fast Processing**: Minimal overhead for detection
- **🔧 Still Customizable**: Override when needed
- **🌐 Universal**: Works with any website type

The auto-detection feature makes the HTML Content Processor truly intelligent, adapting to different content types automatically while maintaining the flexibility for manual fine-tuning when needed. 