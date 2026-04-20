#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');

// ════════════════════════════════════════════════════════════════════════════
// CODE REVIEW GRAPH - Token-Efficient Code Analysis
// ════════════════════════════════════════════════════════════════════════════

class CodeReviewGraph {
  constructor() {
    this.files = new Map();
    this.imports = new Map();
    this.exports = new Map();
    this.symbols = new Map();
    this.dependencies = new Map();
    this.stats = {
      totalFiles: 0,
      totalSymbols: 0,
      totalDependencies: 0,
      filesByType: {}
    };
  }

  // Scan project and build graph
  async buildGraph(rootPath) {
    console.log('📊 Building code review graph...');
    this.scanDirectory(rootPath);
    this.analyzeImports();
    console.log(`✅ Graph built: ${this.stats.totalFiles} files, ${this.stats.totalSymbols} symbols`);
    return this.getStats();
  }

  // Recursively scan directory
  scanDirectory(dir, depth = 0) {
    if (depth > 10) return; // Prevent infinite recursion
    
    const ignore = [
      'node_modules', '.git', '.next', 'build', 'dist', '.env', '.env.local',
      '.venv', '__pycache__', '.pytest_cache', 'venv', '.idea', '.vscode',
      'coverage', '.nyc_output'
    ];

    try {
      const entries = fs.readdirSync(dir);
      
      for (const entry of entries) {
        if (ignore.includes(entry)) continue;
        
        const fullPath = path.join(dir, entry);
        const stat = fs.statSync(fullPath);
        const relPath = path.relative(PROJECT_ROOT, fullPath);

        if (stat.isDirectory()) {
          this.scanDirectory(fullPath, depth + 1);
        } else if (this.isCodeFile(fullPath)) {
          this.analyzeFile(fullPath, relPath);
        }
      }
    } catch (err) {
      // Silently skip inaccessible directories
    }
  }

  // Check if file is a code file
  isCodeFile(filePath) {
    const ext = path.extname(filePath);
    const codeExts = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.h',
      '.cs', '.rb', '.go', '.rs', '.php', '.sql', '.json', '.yaml', '.yml',
      '.xml', '.html', '.css', '.scss', '.less'
    ];
    return codeExts.includes(ext);
  }

  // Analyze individual file
  analyzeFile(filePath, relPath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const ext = path.extname(filePath);
      
      this.files.set(relPath, {
        path: relPath,
        type: ext,
        size: content.length,
        lines: content.split('\n').length
      });

      // Track file types
      if (!this.stats.filesByType[ext]) {
        this.stats.filesByType[ext] = 0;
      }
      this.stats.filesByType[ext]++;
      this.stats.totalFiles++;

      // Extract imports
      this.extractImports(relPath, content, ext);
      
      // Extract symbols (functions, classes, etc.)
      this.extractSymbols(relPath, content, ext);
    } catch (err) {
      // Skip files that can't be read
    }
  }

  // Extract imports from file
  extractImports(filePath, content, ext) {
    const imports = [];
    
    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      // ES6 imports
      const importRegex = /import\s+(?:{[^}]+}|[^\s]+)\s+from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
      // CommonJS requires
      const requireRegex = /require\(['"]([^'"]+)['"]\)/g;
      while ((match = requireRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    } else if (ext === '.py') {
      // Python imports
      const importRegex = /(?:from|import)\s+([^\s]+)/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        imports.push(match[1]);
      }
    }

    if (imports.length > 0) {
      this.imports.set(filePath, imports);
    }
  }

  // Extract symbols from file
  extractSymbols(filePath, content, ext) {
    const symbols = [];

    if (['.js', '.jsx', '.ts', '.tsx'].includes(ext)) {
      // Functions
      const funcRegex = /(?:async\s+)?function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      let match;
      while ((match = funcRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], type: 'function' });
      }

      // Arrow functions
      const arrowRegex = /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*(?:async\s*)?\(/g;
      while ((match = arrowRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], type: 'function' });
      }

      // Classes
      const classRegex = /class\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((match = classRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], type: 'class' });
      }

      // Exports
      const exportRegex = /export\s+(?:default\s+)?(?:const|function|class)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)/g;
      while ((match = exportRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], type: 'export' });
      }
    } else if (ext === '.py') {
      // Python functions and classes
      const defRegex = /def\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
      let match;
      while ((match = defRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], type: 'function' });
      }

      const classRegex = /class\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
      while ((match = classRegex.exec(content)) !== null) {
        symbols.push({ name: match[1], type: 'class' });
      }
    }

    if (symbols.length > 0) {
      this.symbols.set(filePath, symbols);
      this.stats.totalSymbols += symbols.length;
    }
  }

  // Analyze imports to build dependency graph
  analyzeImports() {
    for (const [filePath, imports] of this.imports.entries()) {
      const deps = [];
      
      for (const imp of imports) {
        // Filter out external packages
        if (!imp.startsWith('.') && !imp.startsWith('/')) {
          deps.push({ module: imp, external: true });
        } else {
          deps.push({ module: imp, external: false });
        }
      }
      
      if (deps.length > 0) {
        this.dependencies.set(filePath, deps);
        this.stats.totalDependencies += deps.length;
      }
    }
  }

  // Get statistics
  getStats() {
    return {
      summary: {
        totalFiles: this.stats.totalFiles,
        totalSymbols: this.stats.totalSymbols,
        totalDependencies: this.stats.totalDependencies,
      },
      filesByType: this.stats.filesByType,
      topImports: this.getTopImports(),
      topSymbols: this.getTopSymbols()
    };
  }

  // Get most imported modules
  getTopImports() {
    const importCounts = {};
    for (const imports of this.imports.values()) {
      for (const imp of imports) {
        importCounts[imp] = (importCounts[imp] || 0) + 1;
      }
    }
    return Object.entries(importCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([mod, count]) => ({ module: mod, count }));
  }

  // Get most common symbols
  getTopSymbols() {
    const symbolCounts = {};
    for (const symbols of this.symbols.values()) {
      for (const sym of symbols) {
        const key = sym.name;
        symbolCounts[key] = (symbolCounts[key] || 0) + 1;
      }
    }
    return Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }));
  }

  // Find file by symbol
  findSymbol(symbolName) {
    const results = [];
    for (const [filePath, symbols] of this.symbols.entries()) {
      const match = symbols.find(s => s.name === symbolName);
      if (match) {
        results.push({ file: filePath, symbol: match });
      }
    }
    return results;
  }

  // Find dependencies of a file
  getDependencies(filePath) {
    return {
      file: filePath,
      dependencies: this.dependencies.get(filePath) || [],
      symbols: this.symbols.get(filePath) || []
    };
  }

  // Get file info
  getFileInfo(filePath) {
    return this.files.get(filePath) || null;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ════════════════════════════════════════════════════════════════════════════

async function main() {
  const graph = new CodeReviewGraph();
  
  try {
    const stats = await graph.buildGraph(PROJECT_ROOT);
    
    // Save graph data to file for reference
    const outputFile = path.join(__dirname, 'graph-data.json');
    fs.writeFileSync(outputFile, JSON.stringify({
      timestamp: new Date().toISOString(),
      projectRoot: PROJECT_ROOT,
      stats: stats,
      topImports: Array.from(graph.imports.entries()).slice(0, 5),
      topSymbols: Array.from(graph.symbols.entries()).slice(0, 5)
    }, null, 2));

    console.log('\n📈 Code Review Graph Stats:');
    console.log(`   Files: ${stats.summary.totalFiles}`);
    console.log(`   Symbols: ${stats.summary.totalSymbols}`);
    console.log(`   Dependencies: ${stats.summary.totalDependencies}`);
    console.log(`\n✅ Graph data saved to: graph-data.json`);
    
  } catch (err) {
    console.error('❌ Error building graph:', err.message);
    process.exit(1);
  }
}

// Export for use as module
export { CodeReviewGraph };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
