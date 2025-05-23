#!/usr/bin/env node

/**
 * Test URL Manager
 * Tool for managing test URLs and configurations
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

class TestUrlManager {
  constructor() {
    this.configFile = path.join(__dirname, 'test-urls.json');
    this.loadConfig();
  }

  loadConfig() {
    try {
      this.config = JSON.parse(fs.readFileSync(this.configFile, 'utf8'));
    } catch (error) {
      console.error('❌ Failed to load test configuration:', error.message);
      process.exit(1);
    }
  }

  saveConfig() {
    try {
      fs.writeFileSync(this.configFile, JSON.stringify(this.config, null, 2));
      console.log('✅ Configuration saved successfully');
    } catch (error) {
      console.error('❌ Failed to save configuration:', error.message);
    }
  }

  /**
   * List all test URLs
   */
  listUrls() {
    console.log('📋 Current Test URLs:');
    console.log('='.repeat(50));
    
    Object.entries(this.config.testUrls).forEach(([pageType, urls]) => {
      console.log(`\n🏷️  ${pageType.toUpperCase()} (${urls.length} URLs):`);
      urls.forEach((urlData, index) => {
        console.log(`   ${index + 1}. ${urlData.description}`);
        console.log(`      URL: ${urlData.url}`);
        console.log(`      Expected Confidence: ${(urlData.expectedConfidence * 100).toFixed(1)}%`);
      });
    });
  }

  /**
   * Add a new test URL
   */
  async addUrl() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      console.log('\n📝 Adding new test URL');
      console.log('Available page types:', Object.keys(this.config.testUrls).join(', '));
      
      const pageType = await question('Enter page type: ');
      if (!this.config.testUrls[pageType]) {
        const create = await question(`Page type "${pageType}" doesn't exist. Create it? (y/n): `);
        if (create.toLowerCase() !== 'y') {
          console.log('❌ Cancelled');
          rl.close();
          return;
        }
        this.config.testUrls[pageType] = [];
      }

      const url = await question('Enter URL: ');
      const description = await question('Enter description: ');
      const confidenceInput = await question('Expected confidence (0.0-1.0) [0.7]: ');
      const expectedConfidence = parseFloat(confidenceInput) || 0.7;

      this.config.testUrls[pageType].push({
        url,
        description,
        expectedConfidence
      });

      this.saveConfig();
      console.log(`✅ Added test URL for ${pageType}: ${description}`);
      
    } catch (error) {
      console.error('❌ Error adding URL:', error.message);
    } finally {
      rl.close();
    }
  }

  /**
   * Remove a test URL
   */
  async removeUrl() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      this.listUrls();
      console.log('\n🗑️  Removing test URL');
      
      const pageType = await question('Enter page type: ');
      if (!this.config.testUrls[pageType] || this.config.testUrls[pageType].length === 0) {
        console.log('❌ No URLs found for this page type');
        rl.close();
        return;
      }

      console.log(`\nURLs for ${pageType}:`);
      this.config.testUrls[pageType].forEach((urlData, index) => {
        console.log(`   ${index + 1}. ${urlData.description} (${urlData.url})`);
      });

      const indexInput = await question('Enter URL number to remove: ');
      const index = parseInt(indexInput) - 1;

      if (index < 0 || index >= this.config.testUrls[pageType].length) {
        console.log('❌ Invalid URL number');
        rl.close();
        return;
      }

      const removed = this.config.testUrls[pageType].splice(index, 1)[0];
      this.saveConfig();
      console.log(`✅ Removed: ${removed.description}`);
      
    } catch (error) {
      console.error('❌ Error removing URL:', error.message);
    } finally {
      rl.close();
    }
  }

  /**
   * Update configuration settings
   */
  async updateConfig() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

    try {
      console.log('\n⚙️  Current Configuration:');
      console.log(`   Timeout: ${this.config.testConfig.timeout}ms`);
      console.log(`   Retry Attempts: ${this.config.testConfig.retryAttempts}`);
      console.log(`   Min Confidence: ${(this.config.testConfig.minAcceptableConfidence * 100).toFixed(1)}%`);

      const timeout = await question(`Enter timeout (ms) [${this.config.testConfig.timeout}]: `);
      if (timeout) this.config.testConfig.timeout = parseInt(timeout);

      const retryAttempts = await question(`Enter retry attempts [${this.config.testConfig.retryAttempts}]: `);
      if (retryAttempts) this.config.testConfig.retryAttempts = parseInt(retryAttempts);

      const minConfidence = await question(`Enter min confidence (0.0-1.0) [${this.config.testConfig.minAcceptableConfidence}]: `);
      if (minConfidence) this.config.testConfig.minAcceptableConfidence = parseFloat(minConfidence);

      const userAgent = await question(`Enter User-Agent [current]: `);
      if (userAgent) this.config.testConfig.userAgent = userAgent;

      this.saveConfig();
      console.log('✅ Configuration updated');
      
    } catch (error) {
      console.error('❌ Error updating configuration:', error.message);
    } finally {
      rl.close();
    }
  }

  /**
   * Export URLs to different formats
   */
  exportUrls(format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-urls-export-${timestamp}.${format}`;

    switch (format) {
      case 'json':
        fs.writeFileSync(filename, JSON.stringify(this.config.testUrls, null, 2));
        break;
      
      case 'csv':
        let csv = 'PageType,URL,Description,ExpectedConfidence\n';
        Object.entries(this.config.testUrls).forEach(([pageType, urls]) => {
          urls.forEach(urlData => {
            csv += `"${pageType}","${urlData.url}","${urlData.description}",${urlData.expectedConfidence}\n`;
          });
        });
        fs.writeFileSync(filename, csv);
        break;
      
      case 'md':
        let markdown = '# Test URLs\n\n';
        Object.entries(this.config.testUrls).forEach(([pageType, urls]) => {
          markdown += `## ${pageType}\n\n`;
          urls.forEach(urlData => {
            markdown += `- **${urlData.description}**\n`;
            markdown += `  - URL: ${urlData.url}\n`;
            markdown += `  - Expected Confidence: ${(urlData.expectedConfidence * 100).toFixed(1)}%\n\n`;
          });
        });
        fs.writeFileSync(filename, markdown);
        break;
      
      default:
        console.error('❌ Unsupported format. Use: json, csv, md');
        return;
    }

    console.log(`✅ URLs exported to ${filename}`);
  }

  /**
   * Show statistics
   */
  showStats() {
    console.log('📊 Test URL Statistics:');
    console.log('='.repeat(30));
    
    let totalUrls = 0;
    Object.entries(this.config.testUrls).forEach(([pageType, urls]) => {
      console.log(`${pageType}: ${urls.length} URLs`);
      totalUrls += urls.length;
    });
    
    console.log('-'.repeat(30));
    console.log(`Total: ${totalUrls} URLs`);
    
    // Average confidence by type
    console.log('\n📈 Average Expected Confidence:');
    Object.entries(this.config.testUrls).forEach(([pageType, urls]) => {
      if (urls.length > 0) {
        const avgConfidence = urls.reduce((sum, url) => sum + url.expectedConfidence, 0) / urls.length;
        console.log(`${pageType}: ${(avgConfidence * 100).toFixed(1)}%`);
      }
    });
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2);
  const manager = new TestUrlManager();

  if (args.length === 0) {
    console.log('🛠️  Test URL Manager');
    console.log('Usage: node test-url-manager.js <command>');
    console.log('\nCommands:');
    console.log('  list          - List all test URLs');
    console.log('  add           - Add a new test URL (interactive)');
    console.log('  remove        - Remove a test URL (interactive)');
    console.log('  config        - Update configuration (interactive)');
    console.log('  stats         - Show statistics');
    console.log('  export <fmt>  - Export URLs (json|csv|md)');
    console.log('\nExamples:');
    console.log('  node test-url-manager.js list');
    console.log('  node test-url-manager.js add');
    console.log('  node test-url-manager.js export csv');
    return;
  }

  const command = args[0];

  switch (command) {
    case 'list':
      manager.listUrls();
      break;
    
    case 'add':
      await manager.addUrl();
      break;
    
    case 'remove':
      await manager.removeUrl();
      break;
    
    case 'config':
      await manager.updateConfig();
      break;
    
    case 'stats':
      manager.showStats();
      break;
    
    case 'export':
      const format = args[1] || 'json';
      manager.exportUrls(format);
      break;
    
    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Use: node test-url-manager.js (without arguments) for help');
      process.exit(1);
  }
}

if (require.main === module) {
  main().catch(error => {
    console.error('❌ Manager failed:', error);
    process.exit(1);
  });
}

module.exports = { TestUrlManager }; 