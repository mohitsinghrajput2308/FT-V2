#!/usr/bin/env node

import { CodeReviewGraph } from './mcp-server.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

/**
 * Analyze the codebase and provide token-efficient summaries
 */
async function analyzeCodebase() {
  console.log('🔍 Analyzing codebase for code review...\n');
  
  const graph = new CodeReviewGraph();
  const stats = await graph.buildGraph(PROJECT_ROOT);

  console.log('📊 ANALYSIS RESULTS:');
  console.log('═'.repeat(50));
  
  console.log('\n📁 Files by Type:');
  Object.entries(stats.filesByType)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`   ${type || 'no-ext'}: ${count}`);
    });

  console.log('\n⬇️  Top 10 Most Imported Modules:');
  stats.topImports.forEach((imp, i) => {
    console.log(`   ${i + 1}. ${imp.module} (${imp.count}x)`);
  });

  console.log('\n🔧 Top 10 Most Defined Symbols:');
  stats.topSymbols.forEach((sym, i) => {
    console.log(`   ${i + 1}. ${sym.name} (${sym.count}x)`);
  });

  console.log('\n📈 Summary:');
  console.log(`   Total Files: ${stats.summary.totalFiles}`);
  console.log(`   Total Symbols: ${stats.summary.totalSymbols}`);
  console.log(`   Total Dependencies: ${stats.summary.totalDependencies}`);

  console.log('\n✅ Analysis complete!');
  console.log('💡 Use this data to understand your codebase structure and dependencies.\n');
}

analyzeCodebase().catch(err => {
  console.error('❌ Analysis failed:', err.message);
  process.exit(1);
});
