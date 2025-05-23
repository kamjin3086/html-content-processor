# Auto-Detection Guide

Intelligent page type detection for optimal content processing.

## Quick Start

### Basic Usage
```typescript
import { htmlToMarkdownAuto, cleanHtmlAuto } from 'html-content-processor';

// Auto-detect and convert
const markdown = await htmlToMarkdownAuto(html, url);
const clean = await cleanHtmlAuto(html, url);
```

### Detailed Results
```typescript
import { extractContentAuto } from 'html-content-processor';

const result = await extractContentAuto(html, url);
console.log('Type:', result.pageType.type);
console.log('Confidence:', result.pageType.confidence);
console.log('Markdown:', result.markdown.content);
```

## Supported Page Types

| Type | Optimized For | Key Features |
|------|---------------|--------------|
| `search-engine` | Google, Bing | Aggressive noise removal |
| `blog` | WordPress, Medium | Article structure preservation |
| `news` | News sites | Headline and timestamp focus |
| `documentation` | API docs | Code block preservation |
| `e-commerce` | Product pages | Price extraction |
| `social-media` | Social platforms | Post content focus |
| `forum` | Discussion boards | Thread structure |
| `article` | Long-form content | Text density optimization |
| `landing-page` | Marketing | CTA preservation |

## Auto-Optimized Settings

### Search Engine
- **Threshold**: 8 (aggressive filtering)
- **Ratio**: 0.2 (low text density)
- **Removes**: navigation, forms, scripts

### Blog Posts
- **Threshold**: 3 (moderate filtering)
- **Ratio**: 0.4 (higher text density)
- **Preserves**: article structure, headings
- **Keeps**: article, main, headings, paragraphs

### Documentation
- **Threshold**: 2 (gentle filtering)
- **Strategy**: fixed (consistent)
- **Preserves**: code blocks, lists, structure
- **Keeps**: pre, code, headings, lists

## Advanced Usage

### With HtmlProcessor
```typescript
import { HtmlProcessor } from 'html-content-processor';

const processor = await HtmlProcessor
  .from(html)
  .withAutoDetection(url)
  .filter();

const markdown = await processor.toMarkdown();
```

### Manual Override
```typescript
const processor = await HtmlProcessor
  .from(html)
  .withPageType('blog')  // Force specific type
  .filter();
```

### Detection Only
```typescript
import { pageTypeDetector } from 'html-content-processor';

const result = await pageTypeDetector.detectPageType(html, url);
console.log(result.type, result.confidence);
```

## Detection Process

### 1. URL Analysis
- Domain patterns (`docs.` → documentation)
- Path patterns (`/blog/` → blog)
- Query parameters (`?q=` → search-engine)

### 2. Content Analysis
- HTML structure (semantic elements)
- Text patterns (keywords, density)
- Element characteristics (forms, code blocks)

### 3. Confidence Scoring
- Multiple weighted rules (0.0-1.0)
- URL hints boost accuracy
- Fallback to general article type

## Best Practices

### Always Provide URL
```typescript
// ✅ Better accuracy
const result = await htmlToMarkdownAuto(html, 'https://docs.example.com/api');

// ❌ Less accurate
const result = await htmlToMarkdownAuto(html);
```

### Handle Low Confidence
```typescript
const result = await extractContentAuto(html, url);
if (result.pageType.confidence < 0.7) {
  console.log('Low confidence, consider manual config');
}
```

### Debug Mode
```typescript
const processor = HtmlProcessor.from(html, { debug: true });
// Logs detection details to console
```

## Performance

| Method | Processing Time | Accuracy |
|--------|----------------|----------|
| Auto-detection | ~50ms overhead | 90%+ with URL |
| Manual config | Baseline | Depends on config |

## Common Patterns

### Web Scraping
```typescript
const response = await fetch(url);
const html = await response.text();
const markdown = await htmlToMarkdownAuto(html, response.url);
```

### Batch Processing
```typescript
const results = await Promise.all(
  urls.map(async url => {
    const html = await fetchHtml(url);
    return htmlToMarkdownAuto(html, url);
  })
);
```

### Error Handling
```typescript
try {
  const result = await htmlToMarkdownAuto(html, url);
  console.log(result);
} catch (error) {
  console.error('Auto-detection failed:', error.message);
  // Fallback to manual processing
}
``` 