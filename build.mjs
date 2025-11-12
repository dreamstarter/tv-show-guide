#!/usr/bin/env node

/**
 * Simple build script for TypeScript compilation and file copying
 */

import { execSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';

const isProduction = process.env.NODE_ENV === 'production';

console.log(`🔨 Building TV Show Guide (${isProduction ? 'production' : 'development'} mode)...`);

try {
  // Ensure dist directory exists
  if (!existsSync('dist')) {
    mkdirSync('dist', { recursive: true });
  }

  // Compile TypeScript
  console.log('📝 Compiling TypeScript...');
  execSync('tsc', { stdio: 'inherit' });

  // Copy static files
  console.log('📋 Copying static files...');
  const staticFiles = [
    { src: 'index.html', dest: 'dist/index.html' },
    { src: 'styles.css', dest: 'dist/styles.css' },
    { src: 'television-shows-list.md', dest: 'dist/television-shows-list.md' }
  ];

  for (const { src, dest } of staticFiles) {
    if (existsSync(src)) {
      // Ensure destination directory exists
      mkdirSync(dirname(dest), { recursive: true });
      copyFileSync(src, dest);
      console.log(`  ✓ ${src} → ${dest}`);
    } else {
      console.warn(`  ⚠️ ${src} not found, skipping...`);
    }
  }

  // Update HTML to reference compiled JS files
  console.log('🔗 Updating HTML references...');
  let html = require('fs').readFileSync('dist/index.html', 'utf8');
  html = html.replace('src="validation.js"', 'src="validation.js"');
  html = html.replace('src="script.js"', 'src="script.js"');
  require('fs').writeFileSync('dist/index.html', html);

  console.log('✅ Build completed successfully!');
  console.log('📁 Output directory: ./dist/');
  
  if (!isProduction) {
    console.log('🚀 Run `npm run serve` to start a local server');
  }

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}