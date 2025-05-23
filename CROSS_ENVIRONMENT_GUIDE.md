# Cross-Environment Usage Guide

HTML Content Processor is designed to work seamlessly in both **Node.js** and **browser** environments without requiring different installation or configuration steps.

## 🌍 Environment Support

### ✅ Supported Environments

- **Node.js** 14.0.0+ (with or without jsdom)
- **Modern Browsers** (Chrome, Firefox, Safari, Edge)
- **Webpack** bundled applications
- **Server-side rendering** (SSR) frameworks like Next.js
- **Electron** applications

## 📦 Installation

### Standard Installation

```bash
npm install html-content-processor
```

### For Enhanced Node.js Performance (Recommended)

```bash
npm install html-content-processor jsdom
```

> **Note**: `jsdom` is an optional dependency. HTML Content Processor will work without it but with reduced performance in Node.js environments.

## 🚀 Usage Examples

### Node.js Environment

#### With jsdom (Recommended)

```javascript
// No special setup required - auto-detects jsdom
const { htmlToMarkdown, HtmlProcessor, isNode } = require('html-content-processor');

console.log('Running in:', isNode() ? 'Node.js' : 'Browser');

const html = '<h1>Title</h1><p>Content with <a href="#">link</a></p>';
const markdown = htmlToMarkdown(html);
console.log(markdown);
```

#### Without jsdom (Fallback Mode)

If jsdom is not installed, the library automatically falls back to a basic parser:

```javascript
const { htmlToMarkdown } = require('html-content-processor');

// Works, but with limited DOM functionality
const markdown = htmlToMarkdown('<h1>Simple HTML</h1><p>Text content</p>');
```

### Browser Environment

```javascript
// ES6 Modules
import { htmlToMarkdown, HtmlProcessor } from 'html-content-processor';

// Or CommonJS
const { htmlToMarkdown } = require('html-content-processor');

const html = document.getElementById('content').innerHTML;
const markdown = htmlToMarkdown(html);
```

### TypeScript Support

```typescript
import { 
  HtmlProcessor, 
  ProcessorOptions, 
  MarkdownResult 
} from 'html-content-processor';

const options: ProcessorOptions = {
  filter: { threshold: 3 },
  converter: { citations: true }
};

const result: MarkdownResult = HtmlProcessor
  .from(html)
  .withOptions(options)
  .filter()
  .toMarkdown();
```

## 🔧 Environment Detection

The library automatically detects the runtime environment:

```javascript
import { isNode, isBrowser, domAdapter } from 'html-content-processor';

console.log('Environment:', isNode() ? 'Node.js' : 'Browser');
console.log('Has native DOM:', isBrowser());
console.log('Has jsdom:', domAdapter.hasJSDOM());

// Get detailed environment info
console.log(domAdapter.getEnvironmentInfo());
// {
//   isNode: true,
//   isBrowser: false,
//   hasJSDOM: true,
//   hasNativeDOM: false
// }
```

## 📋 Framework Integration

### Next.js (SSR)

```javascript
// pages/api/convert.js
import { htmlToMarkdown } from 'html-content-processor';

export default function handler(req, res) {
  const { html } = req.body;
  const markdown = htmlToMarkdown(html);
  res.json({ markdown });
}

// components/HtmlConverter.jsx
import { useEffect, useState } from 'react';
import { htmlToMarkdown } from 'html-content-processor';

export default function HtmlConverter({ html }) {
  const [markdown, setMarkdown] = useState('');

  useEffect(() => {
    // Works in browser environment
    setMarkdown(htmlToMarkdown(html));
  }, [html]);

  return <pre>{markdown}</pre>;
}
```

### Express.js Server

```javascript
const express = require('express');
const { htmlToMarkdown, HtmlProcessor } = require('html-content-processor');

const app = express();

app.post('/convert', (req, res) => {
  const { html, baseUrl } = req.body;
  
  const result = HtmlProcessor
    .from(html)
    .withBaseUrl(baseUrl)
    .filter()
    .toMarkdown();
    
  res.json(result);
});
```

### Webpack Configuration

No special webpack configuration is required. The library is pre-configured for bundling:

```javascript
// webpack.config.js - No changes needed
module.exports = {
  // ... your existing config
  // HTML Content Processor works out of the box
};
```

## ⚠️ Important Notes

### DOM API Differences

| Feature | Browser | Node.js + jsdom | Node.js (fallback) |
|---------|---------|-----------------|---------------------|
| HTML Parsing | ✅ Full | ✅ Full | ⚠️ Basic |
| CSS Selectors | ✅ Full | ✅ Full | ❌ Limited |
| DOM Manipulation | ✅ Full | ✅ Full | ⚠️ Basic |
| Performance | ✅ Fast | ✅ Good | ⚠️ Slower |

### Performance Recommendations

1. **Install jsdom** for Node.js environments:
   ```bash
   npm install jsdom
   ```

2. **Use presets** for consistent results:
   ```javascript
   import { htmlToArticleMarkdown } from 'html-content-processor';
   const markdown = htmlToArticleMarkdown(html, baseUrl);
   ```

3. **Cache processors** for repeated use:
   ```javascript
   const processor = HtmlProcessor.from('').withOptions(myOptions);
   // Reuse processor for multiple HTML inputs
   ```

## 🐛 Troubleshooting

### "DOMParser is not defined" Error

This means the DOM adapter couldn't initialize. Solutions:

1. **Install jsdom** (Node.js):
   ```bash
   npm install jsdom
   ```

2. **Check environment** (Browser):
   ```javascript
   if (typeof window === 'undefined') {
     // You're in Node.js, but DOM adapter failed
     console.log('Consider installing jsdom');
   }
   ```

### "Cannot resolve 'jsdom'" Warning

This webpack warning is normal and doesn't affect functionality. The library gracefully handles jsdom absence.

### Limited Functionality Warning

If you see this warning in Node.js:
```
jsdom not found. Installing jsdom is recommended for better performance
```

Install jsdom for full functionality:
```bash
npm install jsdom
```

## 🔍 Testing Your Setup

Use our test script to verify your environment:

```javascript
const { 
  isNode, 
  isBrowser, 
  domAdapter, 
  htmlToMarkdown 
} = require('html-content-processor');

console.log('Environment:', isNode() ? 'Node.js' : 'Browser');
console.log('jsdom available:', domAdapter.hasJSDOM());

// Test basic functionality
const testHtml = '<h1>Test</h1><p>Hello world</p>';
const result = htmlToMarkdown(testHtml);
console.log('Conversion successful:', result.length > 0);
```

## 📞 Support

If you encounter environment-specific issues:

1. Check this guide for your specific setup
2. Verify jsdom installation (Node.js)
3. Test with the provided examples
4. [Open an issue](https://github.com/kamjin3086/html-content-processor/issues) with environment details

---

**The library is designed to "just work" in any JavaScript environment. Install jsdom for the best Node.js experience!** 🚀 