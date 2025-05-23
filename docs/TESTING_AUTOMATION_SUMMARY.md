# Testing Automation

Automated testing system for page type detection accuracy and reliability.

## Overview

- **Real-world testing** against live websites
- **Automated accuracy measurement** with confidence scoring
- **URL management system** for test cases
- **CI/CD integration** with NPM scripts

## Quick Start

### Run Tests
```bash
npm test                    # Run all detection tests
npm run test:detection     # Detailed test run
npm run test:ci           # Build + test pipeline
```

### Manage Test URLs
```bash
# View all test URLs
node tests/test-url-manager.js list

# Add new URL interactively  
node tests/test-url-manager.js add

# Show statistics
node tests/test-url-manager.js stats

# Quick add via command line
node tests/test-detection-accuracy.js add blog "https://example.com" "Blog" 0.8
```

## Test Coverage

### Page Types (18 URLs)
- **Search Engine**: 3 URLs (Google, Bing, DuckDuckGo)
- **Blog**: 3 URLs (GitHub Blog, WordPress, Medium)
- **Documentation**: 3 URLs (GitHub Docs, MDN, Node.js)
- **News**: 3 URLs (BBC, TechCrunch, Hacker News)
- **E-commerce**: 2 URLs (Amazon, Shopify)
- **Forum**: 2 URLs (Stack Overflow, Reddit)
- **Social Media**: 2 URLs (Twitter, LinkedIn)

### Quality Metrics
- **Expected confidence**: 60-80%
- **Network timeout**: 10 seconds
- **Retry attempts**: 2
- **Pass threshold**: 50% confidence

## Configuration

Located in `tests/test-urls.json`:

```json
{
  "testConfig": {
    "timeout": 10000,
    "retryAttempts": 2,
    "minAcceptableConfidence": 0.5
  },
  "search-engine": [
    {
      "url": "https://google.com",
      "description": "Google search homepage",
      "expectedConfidence": 0.9
    }
  ]
}
```

## Test Output

### Console Report
```
🤖 Page Type Detection Accuracy Test
📊 Testing SEARCH-ENGINE (3 URLs)
[1/3] Google search homepage
    Detected: search-engine (95.0%)
    Result: ✅ PASS

📊 SUMMARY
   Total: 18 | Passed: 17 ✅ | Failed: 1 ❌
   Pass Rate: 94.4%
```

### JSON Export
```bash
node tests/test-url-manager.js export json > results.json
node tests/test-url-manager.js export csv > results.csv
```

## URL Management

### Interactive Mode
```bash
node tests/test-url-manager.js
# 1. List URLs
# 2. Add URL  
# 3. Remove URL
# 4. Show stats
# 5. Export data
```

### Command Line
```bash
# List by type
node tests/test-url-manager.js list blog

# Add URL
node tests/test-url-manager.js add documentation "https://docs.example.com"

# Remove URL
node tests/test-url-manager.js remove "https://old-site.com"

# Show statistics
node tests/test-url-manager.js stats
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run test:ci
```

### Exit Codes
- **0**: All tests passed
- **1**: Some tests failed  
- **2**: Configuration error
- **3**: Network error

## Features

### Network Resilience
- Automatic retry on timeout
- Error classification
- Redirect handling
- Custom User-Agent support

### Reporting
- Real-time progress
- Detailed failure analysis
- Multiple export formats
- Historical tracking support

### Flexibility
- Per-URL confidence thresholds
- Type-specific configurations
- Debug mode for troubleshooting
- Easy URL addition/removal

## Maintenance

### Regular Tasks
```bash
# Check test health
npm run test:detection

# Review failing URLs
node tests/test-url-manager.js stats

# Update configurations
vim tests/test-urls.json

# Backup test data
node tests/test-url-manager.js export json > backup.json
```

### Adding New Page Types
1. Update detection logic in `page-type-detector.ts`
2. Add test URLs via URL manager
3. Run tests to verify accuracy
4. Update documentation

This testing system ensures reliable page type detection across diverse real-world content. 