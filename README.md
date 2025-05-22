# HTML Filter and Markdown Converter

A powerful tool for filtering HTML content and converting it to Markdown. It cleans web page content, extracts the core parts, and converts it to high-quality Markdown.

## Key Features

- **HTML Filtering**: Automatically assesses the importance of HTML elements using a pruning algorithm to filter out unnecessary content.
- **Markdown Conversion**: Converts filtered HTML into various Markdown formats.
- **Simple API**: Provides a concise function interface for easy integration into various projects.

## Installation

```bash
npm install html-filter-strategy
```

## Usage

### Basic Usage

```javascript
// Import necessary functions
import { 
  filterHtmlToString, 
  filterHtmlToArray, 
  htmlToMarkdown, 
  htmlToMarkdownWithCitations 
} from 'html-filter-strategy';

// HTML filtering (returns a string)
const cleanHtml = filterHtmlToString('<html>...<div class="main">Important content</div>...</html>');

// HTML filtering (returns an array)
const htmlFragments = filterHtmlToArray('<html>...<div class="main">Important content</div>...</html>');

// HTML to Markdown
const markdownResult = htmlToMarkdown('<p>This is <strong>important</strong> content</p>');
console.log(markdownResult.rawMarkdown); // Output: This is **important** content

// HTML to Markdown with citations
const markdownWithRefs = htmlToMarkdownWithCitations('<p>Check out <a href="https://example.com">this link</a></p>');
```

### Advanced Usage

```javascript
// Import core classes
import { HtmlFilter, DefaultMarkdownGenerator } from 'html-filter-strategy';

// Create a filter with custom configuration
const filter = new HtmlFilter(3, 'dynamic', 0.6); // minWordThreshold 3, dynamic threshold, baseThreshold 0.6

// Use filter methods directly
const filteredContent = filter.filterContent(htmlString);

// Create a custom Markdown generator
const mdGenerator = new DefaultMarkdownGenerator(filter, {
  ignoreLinks: false,
  ignoreImages: true,
  listItemPrefix: '-' // Use hyphen for list item prefix
});

// Generate Markdown
const markdownResult = mdGenerator.generateMarkdown(htmlString, 'https://base.url', options, null, true);
```

## API Reference

### HTML Filtering Functions

#### `filterHtmlToArray(html: string): string[]`

Filters an HTML string into an array of important content fragments.

#### `filterHtmlToString(html: string): string`

Filters an HTML string into a single HTML string.

### Markdown Conversion Functions

#### `htmlToMarkdown(html: string, options?: MarkdownGeneratorOptions, baseUrl?: string, citations?: boolean): MarkdownGenerationResult`

Converts HTML to Markdown, returning an object with results in multiple formats.

#### `htmlToMarkdownWithCitations(html: string, baseUrl?: string): string`

Converts HTML to Markdown text with citations.

#### `htmlToPlainMarkdown(html: string): string`

Converts HTML to plain text Markdown.

#### `htmlToFitMarkdown(html: string): string`

Converts HTML to concise Markdown.

### Core Classes

#### `HtmlFilter`

The core class for the HTML content filter, implementing content importance assessment based on a pruning algorithm.

```typescript
new HtmlFilter(
  minWordThreshold?: number,      // Minimum word count threshold
  thresholdType?: 'fixed' | 'dynamic', // Type of threshold
  threshold?: number              // Threshold value
)
```

#### `DefaultMarkdownGenerator`

The default implementation of the Markdown generator.

```typescript
new DefaultMarkdownGenerator(
  filter: HtmlFilter,            // HtmlFilter instance
  options?: MarkdownGeneratorOptions // Markdown generation options
)
```

## Developer Guide

### Directory Structure

```
html-filter-strategy/
├── src/                    # Source code directory
│   ├── html-filter.ts      # HTML filter implementation
│   ├── html2text.ts        # HTML to text conversion implementation
│   ├── markdown-generator.ts # Markdown generator implementation
│   ├── types.ts            # Type definitions
│   ├── index.ts            # Entry file and API exports
│   ├── test.html           # Test HTML page
│   └── test-example.html   # Test example HTML content
├── demo/                   # Demo directory
│   └── index.html          # Demo page
├── dist/                   # Build output directory
├── package.json            # Package configuration
├── tsconfig.json           # TypeScript configuration
└── webpack.config.js       # Webpack configuration
```

### Build and Test

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run the demo server
npm run dev

# Build the demo
npm run build:demo
```

Visit http://localhost:9000/ for the basic test page, or http://localhost:9000/demo/index.html for the fully functional demo page.

## How It Works

### HTML Filtering

The HTML filter uses an advanced pruning algorithm to assess the importance of HTML content:

1. **Text Density Analysis**: Calculates the ratio of text content to HTML tags in an element.
2. **Link Density Analysis**: Calculates the ratio of linked text to total text in an element.
3. **Tag Importance**: Assigns different weights based on tag type (e.g., `<article>` is more important than `<div>`).
4. **Class and ID Analysis**: Determines if elements are secondary content like navigation or ads based on class names and IDs.
5. **Dynamic Threshold**: Adjusts the judgment threshold based on context to improve accuracy.

### Markdown Conversion

Markdown conversion involves two main steps:

1. **HTML Cleaning and Filtering**: Uses `HtmlFilter` to remove unimportant content.
2. **HTML to Markdown Conversion**: Uses an optimized algorithm to process various HTML elements and convert them to the corresponding Markdown format.

## License

MIT
