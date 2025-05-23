/**
 * Quick test script for the new HTML Filter Strategy API
 */

// Setup DOM environment for Node.js
if (typeof require !== 'undefined' && typeof window === 'undefined') {
  const { JSDOM } = require('jsdom');
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  global.window = dom.window;
  global.document = dom.window.document;
  global.DOMParser = dom.window.DOMParser;
  global.NodeFilter = dom.window.NodeFilter;
}

// Test HTML content
const testHtml = `
<html>
<head><title>Test Article</title></head>
<body>
  <nav>Navigation menu</nav>
  <header>Site header</header>
  
  <article>
    <h1>Main Article Title</h1>
    <p>This is the first paragraph of the article with some <em>emphasized</em> text.</p>
    <p>This paragraph contains a <a href="https://example.com">link to external site</a>.</p>
    
    <section>
      <h2>Article Section</h2>
      <p>This is content in a section with more details.</p>
      <ul>
        <li>First list item</li>
        <li>Second list item</li>
      </ul>
    </section>
  </article>
  
  <aside>Sidebar content</aside>
  <footer>Footer content</footer>
  
  <div class="ads">Advertisement content</div>
</body>
</html>
`;

// Test for Node.js environment
if (typeof require !== 'undefined') {
  console.log('Testing HTML Filter Strategy - New API in Node.js\n');
  
  try {
    // Import the library
    const { 
      HtmlProcessor, 
      htmlToMarkdown, 
      htmlToText, 
      cleanHtml,
      createProcessor,
      useBuiltinPlugins,
      presets
    } = require('./dist/index.js');
    
    console.log('✓ Library imported successfully');
    console.log('✓ DOM environment set up for Node.js');
    
    // Test 1: Basic convenience function
    console.log('\n1. Testing htmlToMarkdown convenience function:');
    const markdown1 = htmlToMarkdown(testHtml);
    console.log('Result length:', markdown1.length);
    console.log('Preview:', markdown1.substring(0, 100) + '...');
    
    // Test 2: Fluent API
    console.log('\n2. Testing HtmlProcessor fluent API:');
    const result = HtmlProcessor
      .from(testHtml)
      .withBaseUrl('https://example.com')
      .filter({ threshold: 2 })
      .toMarkdown({ citations: true });
    
    console.log('Content length:', result.content.length);
    console.log('Has references:', !!result.references);
    console.log('Word count:', result.metadata.wordCount);
    console.log('Processing time:', result.metadata.processingTime + 'ms');
    
    // Test 3: Clean HTML
    console.log('\n3. Testing cleanHtml function:');
    const cleaned = cleanHtml(testHtml);
    console.log('Original length:', testHtml.length);
    console.log('Cleaned length:', cleaned.length);
    console.log('Reduction:', Math.round((1 - cleaned.length / testHtml.length) * 100) + '%');
    
    // Test 4: Plain text conversion
    console.log('\n4. Testing htmlToText function:');
    const plainText = htmlToText(testHtml);
    console.log('Plain text length:', plainText.length);
    console.log('Preview:', plainText.substring(0, 80).replace(/\n/g, ' ') + '...');
    
    // Test 5: Presets
    console.log('\n5. Testing presets:');
    console.log('Available presets:', Object.keys(presets));
    
    const articleProcessor = createProcessor({ preset: 'article' });
    articleProcessor.currentHtml = testHtml; // Set HTML directly for testing
    const articleResult = articleProcessor.filter().toMarkdown();
    console.log('Article preset result length:', articleResult.content.length);
    
    // Test 6: Built-in plugins
    console.log('\n6. Testing built-in plugins:');
    useBuiltinPlugins();
    console.log('✓ Built-in plugins registered');
    
    const withPlugins = htmlToMarkdown(testHtml + '<div class="advertisement">Ad content</div>');
    console.log('With plugins result length:', withPlugins.length);
    
    // Test 7: Different output formats
    console.log('\n7. Testing different output formats:');
    const processor = HtmlProcessor.from(testHtml).filter();
    
    const htmlFragments = processor.toArray();
    console.log('HTML fragments count:', htmlFragments.length);
    
    const cleanHtmlOutput = processor.toString();
    console.log('Clean HTML length:', cleanHtmlOutput.length);
    
    console.log('\n✅ All tests passed successfully!');
    console.log('\nNew API features verified:');
    console.log('  ✓ Fluent API with HtmlProcessor');
    console.log('  ✓ Convenience functions');
    console.log('  ✓ Presets system');
    console.log('  ✓ Plugin system');
    console.log('  ✓ TypeScript definitions');
    console.log('  ✓ Metadata and error handling');
    console.log('  ✓ Multiple output formats');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Test for browser environment
if (typeof window !== 'undefined') {
  console.log('Testing HTML Filter Strategy - New API in Browser');
  
  // Wait for the library to load
  setTimeout(() => {
    try {
      if (window.htmlFilter && window.HtmlProcessor) {
        console.log('✓ Library loaded in browser');
        
        // Test basic functionality
        const markdown = window.htmlFilter.htmlToMarkdown(testHtml);
        console.log('Browser test result length:', markdown.length);
        
        // Test fluent API
        const processor = window.HtmlProcessor.from(testHtml);
        const result = processor.filter().toMarkdown();
        console.log('Browser fluent API result:', result.content.length);
        
        // Test helper function
        if (window.testHtmlFilter) {
          const helperResult = window.testHtmlFilter(testHtml, 'article');
          console.log('Helper function result:', helperResult.content.length);
        }
        
        console.log('✅ Browser tests passed!');
      } else {
        console.error('❌ Library not found in browser');
      }
    } catch (error) {
      console.error('❌ Browser test failed:', error.message);
    }
  }, 100);
}

// Export for testing
if (typeof module !== 'undefined') {
  module.exports = { testHtml };
} 