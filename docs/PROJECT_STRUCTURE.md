# 📁 Project Structure

This document describes the organized structure of the HTML Content Processor project.

## 🏗️ Directory Overview

```
html-content-processor/
├── 📁 src/                    # Source code
│   ├── 📄 index.ts           # Main entry point with clean API exports
│   ├── 📄 html-processor.ts  # Core HTML processor with auto-detection
│   ├── 📄 html-filter.ts     # HTML filtering logic
│   ├── 📄 page-type-detector.ts # Intelligent page type detection
│   ├── 📄 markdown-generator.ts # Markdown conversion engine
│   ├── 📄 convenience-api.ts # Convenience functions including auto APIs
│   ├── 📄 dom-adapter.ts     # Cross-environment DOM abstraction
│   ├── 📄 presets.ts         # Configuration presets for different content
│   ├── 📄 plugin-manager.ts  # Extensible plugin system
│   ├── 📄 types.ts           # TypeScript definitions
│   ├── 📄 version.ts         # Version management
│   └── 📄 html2text.ts       # HTML to text conversion utilities
│
├── 📁 tests/                  # Testing suite
│   ├── 📄 test-urls.json     # Test URL configuration for auto-detection
│   ├── 📄 test-detection-accuracy.js # Page type detection accuracy tests
│   └── 📄 test-url-manager.js # Interactive URL management tool
│
├── 📁 docs/                   # Documentation
│   ├── 📄 API_USAGE_EXAMPLES.md # API usage examples
│   ├── 📄 AUTO_DETECTION_GUIDE.md # Auto-detection feature guide
│   ├── 📄 CONTRIBUTING.md    # Contribution guidelines
│   ├── 📄 CROSS_ENVIRONMENT_GUIDE.md # Cross-platform guide
│   ├── 📄 PROJECT_STRUCTURE.md # This document
│   ├── 📄 TESTING_AUTOMATION_SUMMARY.md # Testing overview
│   └── 📄 TEST_SUITE_GUIDE.md # Test suite usage
│
├── 📁 dist/                   # Compiled output
│   ├── 📄 index.js           # Compiled JavaScript bundle
│   ├── 📄 index.d.ts         # TypeScript declarations
│   ├── 📄 bundle.js          # Browser-optimized bundle
│   └── 📄 ...                # Other compiled files
│
├── 📁 examples/               # Usage examples
│   └── 📄 ...                # Example scripts for different use cases
│
├── 📁 demo/                   # Interactive browser demo
│   └── 📄 index.html         # Demo page showcasing auto-detection
│
├── 📁 scripts/                # Build and maintenance scripts
│   └── 📄 ...                # Utility scripts
│
├── 📄 README.md              # Main documentation
├── 📄 CLEANUP_SUMMARY.md     # API modernization summary
├── 📄 LICENSE                # MIT License
├── 📄 package.json           # Package configuration
├── 📄 tsconfig.json          # TypeScript configuration
├── 📄 webpack.config.js      # Webpack build configuration
└── 📄 .gitignore             # Git ignore rules
```

## 📂 Core Directories

### `src/` - Source Code
Contains all TypeScript source files with modern, clean architecture:
- **Core Classes**: HtmlProcessor (with auto-detection), HtmlFilter, PageTypeDetector
- **Auto-Detection APIs**: htmlToMarkdownAuto, cleanHtmlAuto, extractContentAuto
- **Utilities**: Cross-environment DOM adapter, convenience functions, smart presets
- **Type Definitions**: Comprehensive TypeScript interfaces and types
- **Plugin System**: Extensible plugin architecture for customization

### `tests/` - Automated Testing
Comprehensive testing infrastructure for reliability:
- **test-urls.json**: Curated test URLs covering 9 page types with 20+ real-world examples
- **test-detection-accuracy.js**: Automated accuracy testing for page type detection
- **test-url-manager.js**: Interactive tool for managing and validating test URLs

### `docs/` - Documentation
Professional documentation covering all aspects:
- **API Guides**: Complete usage examples and best practices
- **Feature Guides**: Auto-detection capabilities, cross-environment support
- **Testing Documentation**: Automated testing and quality assurance
- **Contributing Guidelines**: Development standards and procedures

### `dist/` - Build Output
Generated artifacts for distribution:
- **Node.js Bundle**: CommonJS module for server-side usage
- **Browser Bundle**: UMD bundle for client-side usage with global exports
- **TypeScript Declarations**: Complete type definitions for IDE support
- **Source Maps**: Debug support for development

## 🚀 Key Features and APIs

### Auto-Detection Functions
Located in `src/convenience-api.ts`:
- `htmlToMarkdownAuto()` - Intelligent page type detection and conversion
- `cleanHtmlAuto()` - Smart filtering based on detected content type  
- `extractContentAuto()` - Comprehensive extraction with metadata

### Page Type Detection
Powered by `src/page-type-detector.ts`:
- Supports 9 different page types (blog, news, documentation, etc.)
- Confidence scoring for detection accuracy
- URL-based hints for improved accuracy
- Automatic filter optimization per page type

### Modern API Design
Clean exports from `src/index.ts`:
- Functional APIs for simple use cases
- Class-based APIs for advanced workflows
- Automatic detection integration
- Cross-environment compatibility

## 🛠️ NPM Scripts

### Development & Building
- `npm run build` - Full TypeScript compilation and webpack bundling
- `npm run dev` - Development server with hot reloading

### Testing & Quality Assurance
- `npm test` - Run page type detection accuracy tests
- `npm run test:detection` - Specific detection accuracy testing
- `npm run test:ci` - Complete CI/CD pipeline (build + test)
- `npm run test:url:manage` - Interactive URL management for test cases

### Maintenance & Versioning
- `npm run update-docs-version` - Synchronize version across documentation
- `npm run verify-version-sync` - Validate version consistency
- `npm run prepare` - Pre-publish preparation

## 📋 Architectural Principles

### 1. **Modern API Design**
- Clean separation between legacy and modern APIs
- Auto-detection as first-class feature
- Async/await throughout for consistency
- TypeScript-first development

### 2. **Intelligent Content Processing**
- Automatic page type detection and optimization
- Content-aware filtering strategies
- Smart noise removal based on page context
- Confidence-based decision making

### 3. **Cross-Environment Compatibility**
- Unified API for browser and Node.js
- Automatic environment detection
- Graceful fallbacks for missing dependencies
- Performance optimization per environment

### 4. **Extensibility & Customization**
- Plugin system for custom processing
- Configurable presets for different content types
- Fine-tuned options for specific use cases
- Comprehensive configuration options

## 🔧 Working with the Project

### Using Auto-Detection APIs
```typescript
import { htmlToMarkdownAuto } from 'html-content-processor';

// Automatic page type detection and optimized processing
const result = await htmlToMarkdownAuto(html, url);
```

### Adding New Page Types
1. Update `src/page-type-detector.ts` with detection rules
2. Add test cases to `tests/test-urls.json`
3. Update documentation in `docs/`

### Running Development Environment
```bash
npm run dev
# Starts development server at http://localhost:9000
# Includes live demo with auto-detection examples
```

### Testing Auto-Detection Accuracy
```bash
npm run test:detection
# Tests detection accuracy across all configured URLs
# Provides detailed confidence scores and error analysis
```

## 📊 Quality Metrics

### Testing Coverage
- **Page Types**: 9 different content types covered
- **Test URLs**: 20+ real-world examples
- **Detection Accuracy**: Automated scoring and validation
- **Cross-Environment**: Browser and Node.js compatibility testing

### Performance Benchmarks
- **Processing Speed**: Optimized for <50ms typical processing time
- **Memory Usage**: Minimal footprint with efficient algorithms
- **Bundle Size**: Optimized builds for both browser and Node.js
- **Auto-Detection**: Fast page type analysis with caching

## 📝 Benefits of This Architecture

- ✅ **Professional Structure**: Industry-standard organization
- ✅ **Modern APIs**: Clean, intuitive interface design
- ✅ **Intelligent Processing**: Auto-detection and optimization
- ✅ **High Quality**: Comprehensive testing and documentation
- ✅ **Developer Friendly**: TypeScript support and excellent DX
- ✅ **Production Ready**: Cross-environment compatibility and performance
- ✅ **Maintainable**: Clear separation of concerns and modularity
- ✅ **Extensible**: Plugin system and customization options

This structure supports the library's goal of providing intelligent, automatic HTML content processing while maintaining professional code quality and developer experience. 