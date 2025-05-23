# Cross-Environment Guide

Seamless usage across Node.js and browser environments.

## Installation

### Basic
```bash
npm install html-content-processor
```

### Enhanced Node.js Performance
```bash
npm install html-content-processor jsdom
```

## Usage

### Node.js
```typescript
import { htmlToMarkdown, isNode } from 'html-content-processor';

// Auto-detects jsdom if available
const markdown = await htmlToMarkdown(html);
console.log('Environment:', isNode() ? 'Node.js' : 'Browser');
```

### Browser
```typescript
import { htmlToMarkdown } from 'html-content-processor';

const html = document.getElementById('content').innerHTML;
const markdown = await htmlToMarkdown(html);
```

### CDN
```html
<script src="https://unpkg.com/html-content-processor"></script>
<script>
  htmlFilter.htmlToMarkdown(html).then(console.log);
</script>
```

## Framework Integration

### Next.js
```typescript
// pages/api/convert.ts
import { htmlToMarkdown } from 'html-content-processor';

export default async function handler(req, res) {
  const { html } = req.body;
  const markdown = await htmlToMarkdown(html);
  res.json({ markdown });
}

// components/Converter.tsx
import { htmlToMarkdown } from 'html-content-processor';

export default function Converter({ html }) {
  const [markdown, setMarkdown] = useState('');
  
  useEffect(() => {
    htmlToMarkdown(html).then(setMarkdown);
  }, [html]);
  
  return <pre>{markdown}</pre>;
}
```

### Express.js
```typescript
import express from 'express';
import { HtmlProcessor } from 'html-content-processor';

const app = express();

app.post('/convert', async (req, res) => {
  const { html, baseUrl } = req.body;
  
  const result = await HtmlProcessor
    .from(html)
    .withBaseUrl(baseUrl)
    .filter()
    .toMarkdown();
    
  res.json(result);
});
```

### Vite/Webpack
No configuration needed - works out of the box.

## Environment Detection

```typescript
import { isNode, isBrowser, domAdapter } from 'html-content-processor';

console.log('Node.js:', isNode());
console.log('Browser:', isBrowser());
console.log('Has jsdom:', domAdapter.hasJSDOM());
```

## Capabilities by Environment

| Feature | Browser | Node.js + jsdom | Node.js (fallback) |
|---------|---------|-----------------|---------------------|
| HTML Parsing | ✅ Full | ✅ Full | ⚠️ Basic |
| CSS Selectors | ✅ Full | ✅ Full | ❌ Limited |
| Performance | ✅ Native | ✅ Good | ⚠️ Slower |

## Best Practices

### For Node.js
1. Install `jsdom` for optimal performance
2. Use auto-detection APIs for better results
3. Handle async/await properly

### For Browsers
1. Use ES modules for modern builds
2. Consider CDN for quick prototyping
3. Bundle size is optimized (~50KB)

### Universal Code
```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// Works in both environments
const processContent = async (html: string, url?: string) => {
  try {
    return await htmlToMarkdownAuto(html, url);
  } catch (error) {
    console.error('Processing failed:', error.message);
    return null;
  }
};
```

## Error Handling

```typescript
try {
  const markdown = await htmlToMarkdown(html);
} catch (error) {
  if (error.message.includes('DOM')) {
    console.error('DOM parsing failed. Consider installing jsdom for Node.js');
  } else {
    console.error('Processing error:', error.message);
  }
}
```

## TypeScript Support

Full TypeScript support with complete type definitions:

```typescript
import { 
  HtmlProcessor, 
  ProcessorOptions, 
  MarkdownResult,
  ConvertOptions
} from 'html-content-processor';

const options: ProcessorOptions = {
  filter: { threshold: 3 },
  converter: { citations: true }
};

const result: MarkdownResult = await HtmlProcessor
  .from(html)
  .withOptions(options)
  .filter()
  .toMarkdown();
``` 