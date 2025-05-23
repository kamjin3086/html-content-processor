#!/usr/bin/env node

/**
 * Script to update version numbers in documentation files
 * Reads version from package.json and updates all documentation
 */

const fs = require('fs');
const path = require('path');
const packageJson = require('../package.json');

const version = packageJson.version;
const versionRegex = /v?\d+\.\d+\.\d+/g;

// Documentation files to update
const docsToUpdate = [
  'README.md',
  'API_USAGE_EXAMPLES.md',
  'CROSS_ENVIRONMENT_GUIDE.md'
];

// Patterns to replace - more specific patterns to avoid replacing dependency versions
const replacePatterns = [
  {
    // Match version in comments like "v1.0.0" or "(v1.0.0)"
    pattern: /\(v\d+\.\d+\.\d+\)/g,
    replacement: `(v${version})`
  },
  {
    // Match version in plugin examples like version: '1.0.0'
    pattern: /version:\s*['"`]\d+\.\d+\.\d+['"`]/g,
    replacement: `version: '${version}'`
  },
  {
    // Match "API (v1.0.0)" pattern
    pattern: /API \(v\d+\.\d+\.\d+\)/g,
    replacement: `API (v${version})`
  },
  {
    // Match version badges in README
    pattern: /badge\.fury\.io\/js\/html-content-processor\.svg/g,
    replacement: `badge.fury.io/js/html-content-processor.svg`
  }
];

console.log(`📝 Updating documentation versions to ${version}...`);

docsToUpdate.forEach(filename => {
  const filepath = path.join(__dirname, '..', filename);
  
  if (!fs.existsSync(filepath)) {
    console.log(`⚠️  File not found: ${filename}`);
    return;
  }
  
  let content = fs.readFileSync(filepath, 'utf8');
  let hasChanges = false;
  
  replacePatterns.forEach(({ pattern, replacement }) => {
    const newContent = content.replace(pattern, replacement);
    if (newContent !== content) {
      content = newContent;
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`✅ Updated: ${filename}`);
  } else {
    console.log(`📄 No changes needed: ${filename}`);
  }
});

console.log(`🎉 Documentation version update completed!`);

// Verify package-lock.json version matches
const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
if (fs.existsSync(packageLockPath)) {
  const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
  if (packageLock.version !== version) {
    console.log(`📦 Updating package-lock.json version from ${packageLock.version} to ${version}`);
    packageLock.version = version;
    fs.writeFileSync(packageLockPath, JSON.stringify(packageLock, null, 2) + '\n', 'utf8');
    console.log(`✅ Updated package-lock.json`);
  }
} 