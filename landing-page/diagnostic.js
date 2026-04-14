#!/usr/bin/env node

/**
 * FinTrack Development Environment Diagnostic
 * Checks configuration and identifies common issues
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const APP_DIR = __dirname;
const PKG_PATH = path.join(APP_DIR, 'package.json');

let errors = [];
let warnings = [];
let success = [];

console.log(`
╔════════════════════════════════════════════════════════════╗
║         FinTrack Development Environment Diagnostic        ║
╚════════════════════════════════════════════════════════════╝
`);

// 1. Check if package.json exists
console.log('🔍 Checking configuration files...');
if (!fs.existsSync(PKG_PATH)) {
  errors.push('package.json not found');
  console.log('  ❌ package.json not found');
} else {
  success.push('package.json found');
  console.log('  ✓ package.json found');
}

// 2. Check if node_modules exists
const nodeModulesPath = path.join(APP_DIR, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  warnings.push('node_modules not found - run: npm install');
  console.log('  ⚠️  node_modules not found - run: npm install');
} else {
  success.push('node_modules installed');
  console.log('  ✓ node_modules installed');
}

// 3. Check if .env.local exists
const envPath = path.join(APP_DIR, '.env.local');
if (!fs.existsSync(envPath)) {
  warnings.push('.env.local not found (required for AI chat)');
  console.log('  ⚠️  .env.local not found (create for AI chat support)');
} else {
  const envContent = fs.readFileSync(envPath, 'utf8');
  if (envContent.includes('GROQ_API_KEY')) {
    success.push('GROQ_API_KEY configured in .env.local');
    console.log('  ✓ GROQ_API_KEY configured in .env.local');
  } else {
    warnings.push('GROQ_API_KEY not set in .env.local');
    console.log('  ⚠️  GROQ_API_KEY not set in .env.local');
  }
}

// 4. Check public directory
const publicPath = path.join(APP_DIR, 'public');
console.log('\n🔍 Checking public directory...');
if (!fs.existsSync(publicPath)) {
  errors.push('public directory missing');
  console.log('  ❌ public directory missing');
} else {
  success.push('public directory found');
  console.log('  ✓ public directory found');
  
  // Check for important assets
  const assets = ['index.html', 'manifest.json', 'favicon.ico'];
  assets.forEach(asset => {
    const assetPath = path.join(publicPath, asset);
    if (fs.existsSync(assetPath)) {
      console.log(`    ✓ ${asset} found`);
    } else {
      warnings.push(`${asset} not found in public/`);
      console.log(`    ⚠️  ${asset} not found`);
    }
  });
}

// 5. Check craco config
console.log('\n🔍 Checking config files...');
const cracoDeps = ['craco', 'react-scripts', 'tailwindcss'];
const pkg = JSON.parse(fs.readFileSync(PKG_PATH, 'utf8'));

cracoDeps.forEach(dep => {
  if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
    console.log(`  ✓ ${dep} configured`);
  } else {
    warnings.push(`${dep} not found in dependencies`);
    console.log(`  ⚠️  ${dep} not found in dependencies`);
  }
});

// 6. Check scripts
console.log('\n🔍 Checking npm scripts...');
const scripts = ['dev', 'start', 'build'];
scripts.forEach(script => {
  if (pkg.scripts?.[script]) {
    console.log(`  ✓ npm run ${script} available`);
  } else {
    warnings.push(`npm script "${script}" not found`);
    console.log(`  ⚠️  npm script "${script}" not found`);
  }
});

// 7. Port availability check (optional)
console.log('\n🔍 Checking port availability...');
const ports = [3000, 3001];

const checkPort = (port) => {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        resolve(false);
      } else {
        resolve(true);
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, '127.0.0.1');
  });
};

(async () => {
  for (const port of ports) {
    const available = await checkPort(port);
    if (available) {
      console.log(`  ✓ Port ${port} available`);
    } else {
      warnings.push(`Port ${port} is in use`);
      console.log(`  ⚠️  Port ${port} is in use`);
    }
  }

  // Summary
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                      DIAGNOSTIC SUMMARY                     ║
╚════════════════════════════════════════════════════════════╝
`);

  console.log(`✅ Success: ${success.length}`);
  if (success.length > 0) {
    success.forEach(msg => console.log(`   • ${msg}`));
  }

  if (warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${warnings.length}`);
    warnings.forEach(msg => console.log(`   • ${msg}`));
  }

  if (errors.length > 0) {
    console.log(`\n❌ Errors: ${errors.length}`);
    errors.forEach(msg => console.log(`   • ${msg}`));
  }

  // Ready to start?
  console.log('\n' + '─'.repeat(60));
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ Everything looks good! Ready to start:\n   npm run dev\n');
    process.exit(0);
  } else if (errors.length === 0) {
    console.log('⚠️  Setup complete, but address warnings above.\n   npm run dev (may have issues)\n');
    process.exit(0);
  } else {
    console.log('❌ Fix errors above before starting.\n');
    process.exit(1);
  }
})();
