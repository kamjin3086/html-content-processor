# API Usage Examples

Quick reference for `html-content-processor` with practical examples.

## Quick Start

### Basic Conversion
```typescript
import { htmlToMarkdown, htmlToText, cleanHtml } from 'html-content-processor';

const html = '<h1>Title</h1><p>Content with <a href="example.com">link</a></p>';

const markdown = await htmlToMarkdown(html);
const text = await htmlToText(html);
const clean = await cleanHtml(html);
```

### Auto-Detection (Recommended)
```typescript
import { htmlToMarkdownAuto, cleanHtmlAuto } from 'html-content-processor';

// Automatic page type detection and optimization
const markdown = await htmlToMarkdownAuto(html, 'https://blog.example.com/post');
const clean = await cleanHtmlAuto(html, 'https://news.example.com/article');
```

## HtmlProcessor Class

### Method Chaining
```typescript
import { HtmlProcessor } from 'html-content-processor';

const result = await HtmlProcessor
  .from(html)
  .withAutoDetection(url)
  .filter()
  .toMarkdown();
```

### Custom Configuration
```typescript
const processor = HtmlProcessor.from(html, {
  filter: { threshold: 3, strategy: 'dynamic' },
  converter: { citations: true }
});

await processor.filter();
const markdown = await processor.toMarkdown();
const text = await processor.toText();
const fragments = await processor.toArray();
```

## Content-Specific Processing

### Presets
```typescript
import { 
  htmlToArticleMarkdown,
  htmlToBlogMarkdown,
  htmlToNewsMarkdown
} from 'html-content-processor';

const articleMd = await htmlToArticleMarkdown(html, baseUrl);
const blogMd = await htmlToBlogMarkdown(html, baseUrl);
const newsMd = await htmlToNewsMarkdown(html, baseUrl);
```

### Manual Page Type
```typescript
const processor = await HtmlProcessor
  .from(html)
  .withPageType('blog')
  .filter();

const result = await processor.toMarkdown();
```

## Advanced Features

### Detailed Results
```typescript
import { extractContentAuto } from 'html-content-processor';

const result = await extractContentAuto(html, url);
console.log('Page type:', result.pageType.type);
console.log('Confidence:', result.pageType.confidence);
console.log('Markdown:', result.markdown.content);
```

### Citations and Links
```typescript
import { htmlToMarkdownWithCitations } from 'html-content-processor';

const withRefs = await htmlToMarkdownWithCitations(html, baseUrl);
// Includes inline citations and reference list
```

### Custom Filtering
```typescript
const processor = HtmlProcessor.from(html, {
  filter: {
    threshold: 2,
    ratio: 0.4,
    keepElements: ['article', 'main', 'section'],
    removeElements: ['nav', 'aside', 'footer']
  }
});
```

## Browser Usage

### CDN
```html
<script src="https://unpkg.com/html-content-processor"></script>
<script>
  htmlFilter.htmlToMarkdown(html).then(console.log);
  htmlFilter.htmlToMarkdownAuto(html, window.location.href).then(console.log);
</script>
```

### ES Modules
```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// Web scraping example
fetch('/api/content')
  .then(res => res.text())
  .then(html => htmlToMarkdownAuto(html, window.location.href))
  .then(markdown => console.log(markdown));
```

## Error Handling

```typescript
try {
  const result = await htmlToMarkdownAuto(html, url);
  console.log(result);
} catch (error) {
  console.error('Processing failed:', error.message);
}
```

## Performance Tips

- Use auto-detection APIs for optimal results
- Enable caching for repeated processing
- Use presets for common content types
- Consider Node.js with jsdom for best performance
