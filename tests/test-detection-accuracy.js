#!/usr/bin/env node

/**
 * Page Type Detection Accuracy Test Suite
 * Automatically tests detection accuracy against real websites
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');
const { URL } = require('url');
const { pageTypeDetector } = require('../dist/index.js');

// Load test configuration
const configPath = path.join(__dirname, 'test-urls.json');
const testConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

class DetectionAccuracyTester {
  constructor() {
    this.results = {
      total: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      details: []
    };
    this.config = testConfig.testConfig;
  }

  /**
   * Fetch HTML content from URL with timeout and retry
   */
  async fetchHtml(url, retryCount = 0) {
    return new Promise((resolve, reject) => {
      const urlObj = new URL(url);
      const isHttps = urlObj.protocol === 'https:';
      const client = isHttps ? https : http;
      
      const options = {
        hostname: urlObj.hostname,
        port: urlObj.port || (isHttps ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: 'GET',
        timeout: this.config.timeout,
        headers: {
          'User-Agent': this.config.userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Connection': 'keep-alive'
        }
      };

      const req = client.request(options, (res) => {
        let data = '';
        
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith('http') 
            ? res.headers.location 
            : new URL(res.headers.location, url).toString();
          
          if (retryCount < this.config.retryAttempts) {
            resolve(this.fetchHtml(redirectUrl, retryCount + 1));
            return;
          }
        }

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          }
        });
      });

      req.on('error', (error) => {
        if (retryCount < this.config.retryAttempts) {
          console.log(`  Retrying ${url} (attempt ${retryCount + 1}/${this.config.retryAttempts})`);
          setTimeout(() => {
            resolve(this.fetchHtml(url, retryCount + 1));
          }, 1000 * (retryCount + 1));
        } else {
          reject(error);
        }
      });

      req.on('timeout', () => {
        req.destroy();
        reject(new Error('Request timeout'));
      });

      req.end();
    });
  }

  /**
   * Test a single URL
   */
  async testUrl(expectedType, testCase) {
    console.log(`  Testing: ${testCase.description}`);
    console.log(`    URL: ${testCase.url}`);
    
    try {
      const html = await this.fetchHtml(testCase.url);
      const detection = pageTypeDetector.detectPageType(html, testCase.url);
      
      const isTypeCorrect = detection.type === expectedType;
      const isConfidenceAcceptable = detection.confidence >= this.config.minAcceptableConfidence;
      const isExpectedConfidence = detection.confidence >= (testCase.expectedConfidence || 0.5);
      
      const passed = isTypeCorrect && isConfidenceAcceptable;
      
      const result = {
        url: testCase.url,
        description: testCase.description,
        expectedType,
        detectedType: detection.type,
        confidence: detection.confidence,
        expectedConfidence: testCase.expectedConfidence,
        passed,
        reasons: detection.reasons,
        characteristics: detection.characteristics
      };

      console.log(`    Expected: ${expectedType}`);
      console.log(`    Detected: ${detection.type}`);
      console.log(`    Confidence: ${(detection.confidence * 100).toFixed(1)}%`);
      console.log(`    Expected Confidence: ≥${(testCase.expectedConfidence * 100).toFixed(1)}%`);
      console.log(`    Result: ${passed ? '✅ PASS' : '❌ FAIL'}`);
      
      if (!isTypeCorrect) {
        console.log(`    ⚠️  Type mismatch: expected ${expectedType}, got ${detection.type}`);
      }
      
      if (!isExpectedConfidence) {
        console.log(`    ⚠️  Low confidence: ${(detection.confidence * 100).toFixed(1)}% < ${(testCase.expectedConfidence * 100).toFixed(1)}%`);
      }

      console.log(`    Detection reasons: ${detection.reasons.join(', ')}`);
      
      this.results.details.push(result);
      
      if (passed) {
        this.results.passed++;
      } else {
        this.results.failed++;
      }
      
      return result;
      
    } catch (error) {
      console.log(`    ❌ ERROR: ${error.message}`);
      
      const errorResult = {
        url: testCase.url,
        description: testCase.description,
        expectedType,
        error: error.message,
        passed: false
      };
      
      this.results.details.push(errorResult);
      this.results.errors++;
      
      return errorResult;
    }
  }

  /**
   * Test all URLs for a specific page type
   */
  async testPageType(pageType) {
    const testCases = testConfig.testUrls[pageType];
    if (!testCases || testCases.length === 0) {
      console.log(`⚠️  No test cases found for page type: ${pageType}`);
      return;
    }

    console.log(`\n📊 Testing ${pageType.toUpperCase()} (${testCases.length} URLs)`);
    console.log('='.repeat(60));

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n[${i + 1}/${testCases.length}]`);
      
      await this.testUrl(pageType, testCase);
      this.results.total++;
      
      // Small delay to be respectful to servers
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Run all tests
   */
  async runAllTests() {
    console.log('🤖 Page Type Detection Accuracy Test Suite');
    console.log('='.repeat(50));
    console.log(`📅 Started at: ${new Date().toISOString()}`);
    console.log(`⚙️  Configuration:`);
    console.log(`   - Timeout: ${this.config.timeout}ms`);
    console.log(`   - Retry attempts: ${this.config.retryAttempts}`);
    console.log(`   - Min confidence: ${(this.config.minAcceptableConfidence * 100).toFixed(1)}%`);

    const pageTypes = Object.keys(testConfig.testUrls);
    
    for (const pageType of pageTypes) {
      try {
        await this.testPageType(pageType);
      } catch (error) {
        console.error(`\n❌ Error testing ${pageType}:`, error.message);
      }
    }

    this.generateReport();
  }

  /**
   * Generate test report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST RESULTS SUMMARY');
    console.log('='.repeat(60));
    
    const passRate = this.results.total > 0 ? (this.results.passed / this.results.total * 100).toFixed(1) : 0;
    
    console.log(`📈 Overall Results:`);
    console.log(`   Total Tests: ${this.results.total}`);
    console.log(`   Passed: ${this.results.passed} ✅`);
    console.log(`   Failed: ${this.results.failed} ❌`);
    console.log(`   Errors: ${this.results.errors} 🚫`);
    console.log(`   Pass Rate: ${passRate}%`);
    
    // Detailed results by page type
    const typeResults = {};
    this.results.details.forEach(result => {
      const type = result.expectedType;
      if (!typeResults[type]) {
        typeResults[type] = { total: 0, passed: 0, failed: 0, errors: 0 };
      }
      typeResults[type].total++;
      if (result.error) {
        typeResults[type].errors++;
      } else if (result.passed) {
        typeResults[type].passed++;
      } else {
        typeResults[type].failed++;
      }
    });

    console.log(`\n📋 Results by Page Type:`);
    Object.entries(typeResults).forEach(([type, stats]) => {
      const typePassRate = stats.total > 0 ? (stats.passed / stats.total * 100).toFixed(1) : 0;
      console.log(`   ${type}: ${stats.passed}/${stats.total} (${typePassRate}%) ${stats.passed === stats.total ? '✅' : '❌'}`);
    });

    // Failed tests details
    const failedTests = this.results.details.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.log(`\n🔍 Failed Tests Details:`);
      failedTests.forEach(test => {
        console.log(`   ❌ ${test.description}`);
        console.log(`      URL: ${test.url}`);
        if (test.error) {
          console.log(`      Error: ${test.error}`);
        } else {
          console.log(`      Expected: ${test.expectedType}, Got: ${test.detectedType}`);
          console.log(`      Confidence: ${(test.confidence * 100).toFixed(1)}%`);
        }
      });
    }

    // Save detailed results
    const reportFile = `test-results-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    fs.writeFileSync(reportFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        errors: this.results.errors,
        passRate: parseFloat(passRate)
      },
      typeResults,
      details: this.results.details
    }, null, 2));

    console.log(`\n💾 Detailed results saved to: ${reportFile}`);

    // Exit with appropriate code
    const success = this.results.failed === 0 && this.results.errors === 0;
    console.log(`\n${success ? '✅ ALL TESTS PASSED!' : '❌ SOME TESTS FAILED!'}`);
    
    return success;
  }

  /**
   * Add new test URL
   */
  static addTestUrl(pageType, url, description, expectedConfidence = 0.7) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!config.testUrls[pageType]) {
      config.testUrls[pageType] = [];
    }
    
    config.testUrls[pageType].push({
      url,
      description,
      expectedConfidence
    });
    
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`✅ Added test URL for ${pageType}: ${url}`);
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  
  if (args[0] === 'add') {
    // Add new test URL: node test-detection-accuracy.js add <type> <url> <description> [confidence]
    const [, pageType, url, description, expectedConfidence] = args;
    if (!pageType || !url || !description) {
      console.error('Usage: node test-detection-accuracy.js add <pageType> <url> <description> [expectedConfidence]');
      process.exit(1);
    }
    DetectionAccuracyTester.addTestUrl(pageType, url, description, parseFloat(expectedConfidence) || 0.7);
    return;
  }

  // Run tests
  const tester = new DetectionAccuracyTester();
  const success = await tester.runAllTests();
  process.exit(success ? 0 : 1);
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { DetectionAccuracyTester }; 