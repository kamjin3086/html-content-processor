#!/usr/bin/env node

/**
 * Script to verify that all version numbers are synchronized
 * across the codebase and documentation
 */

const fs = require('fs');
const path = require('path');

// Read package.json version as the source of truth
const packageJson = require('../package.json');
const expectedVersion = packageJson.version;

console.log(`🔍 Verifying version synchronization (expected: ${expectedVersion})...`);

let hasErrors = false;

// Check compiled code has the correct version
function checkCompiledVersion() {
  const distIndexPath = path.join(__dirname, '..', 'dist', 'index.js');
  if (fs.existsSync(distIndexPath)) {
    const content = fs.readFileSync(distIndexPath, 'utf8');
    // Check for both version patterns used in the compiled code
    if (content.includes(`version: version_1.VERSION`) || 
        content.includes(`version: "${expectedVersion}"`) ||
        content.includes(`Version: \${htmlFilterAPI.version}`)) {
      console.log('✅ Compiled code version is correct');
    } else {
      console.log('❌ Compiled code version is outdated - run npm run build');
      hasErrors = true;
    }
  } else {
    console.log('⚠️  Compiled code not found - run npm run build');
  }
}

// Check version.ts exports the correct version
function checkVersionModule() {
  try {
    // Since we can't directly import TypeScript, we'll check the compiled version
    const versionModulePath = path.join(__dirname, '..', 'dist', 'version.js');
    if (fs.existsSync(versionModulePath)) {
      const versionModule = require(versionModulePath);
      if (versionModule.VERSION === expectedVersion) {
        console.log('✅ Version module exports correct version');
      } else {
        console.log(`❌ Version module exports ${versionModule.VERSION}, expected ${expectedVersion}`);
        hasErrors = true;
      }
    } else {
      console.log('⚠️  Version module not compiled - run npm run build');
    }
  } catch (error) {
    console.log('⚠️  Could not verify version module:', error.message);
  }
}

// Check documentation files
function checkDocumentationVersions() {
  const docsToCheck = [
    'README.md',
    'API_USAGE_EXAMPLES.md'
  ];

  docsToCheck.forEach(filename => {
    const filepath = path.join(__dirname, '..', filename);
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf8');
      
      // Look for version patterns that should match
      const versionMatches = content.match(/version:\s*['"`](\d+\.\d+\.\d+)['"`]/g);
      const apiVersionMatches = content.match(/API \(v(\d+\.\d+\.\d+)\)/g);
      
      let fileHasErrors = false;
      
      if (versionMatches) {
        versionMatches.forEach(match => {
          const version = match.match(/(\d+\.\d+\.\d+)/)[1];
          if (version !== expectedVersion) {
            console.log(`❌ ${filename}: Found version ${version}, expected ${expectedVersion}`);
            fileHasErrors = true;
            hasErrors = true;
          }
        });
      }
      
      if (apiVersionMatches) {
        apiVersionMatches.forEach(match => {
          const version = match.match(/v(\d+\.\d+\.\d+)/)[1];
          if (version !== expectedVersion) {
            console.log(`❌ ${filename}: Found API version ${version}, expected ${expectedVersion}`);
            fileHasErrors = true;
            hasErrors = true;
          }
        });
      }
      
      if (!fileHasErrors) {
        console.log(`✅ ${filename}: All versions are correct`);
      }
    } else {
      console.log(`⚠️  ${filename} not found`);
    }
  });
}

// Check package-lock.json
function checkPackageLockVersion() {
  const packageLockPath = path.join(__dirname, '..', 'package-lock.json');
  if (fs.existsSync(packageLockPath)) {
    const packageLock = JSON.parse(fs.readFileSync(packageLockPath, 'utf8'));
    if (packageLock.version === expectedVersion) {
      console.log('✅ package-lock.json version is correct');
    } else {
      console.log(`❌ package-lock.json version is ${packageLock.version}, expected ${expectedVersion}`);
      hasErrors = true;
    }
  } else {
    console.log('⚠️  package-lock.json not found');
  }
}

// Run all checks
checkVersionModule();
checkCompiledVersion();
checkDocumentationVersions();
checkPackageLockVersion();

if (hasErrors) {
  console.log('\n❌ Version synchronization errors found!');
  console.log('💡 Run the following to fix:');
  console.log('   npm run update-docs-version');
  console.log('   npm run build');
  process.exit(1);
} else {
  console.log('\n🎉 All version numbers are synchronized!');
  process.exit(0);
} 