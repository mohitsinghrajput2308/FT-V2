#!/usr/bin/env node

/**
 * MCP Server Registration & Auto-Discovery
 * Works with: VS Code, Google Cloud IDE, Gitpod, GitHub Codespaces, Replit, etc.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = process.env.PROJECT_ROOT || path.resolve(__dirname, '..');

console.log('🔧 Registering MCP Server for multi-IDE support...\n');

// ════════════════════════════════════════════════════════════════════════════
// DETECT IDE ENVIRONMENT
// ════════════════════════════════════════════════════════════════════════════

function detectIDE() {
  const env = process.env;
  
  // Google Cloud IDE
  if (env.GOOGLE_APPLICATION_CREDENTIALS || env.CLOUD_SHELL) {
    return 'google-cloud-ide';
  }
  
  // Gitpod
  if (env.GITPOD_WORKSPACE_ID) {
    return 'gitpod';
  }
  
  // GitHub Codespaces
  if (env.CODESPACES) {
    return 'github-codespaces';
  }
  
  // Replit
  if (env.REPLIT_DB_URL || env.REPLIT_OWNER) {
    return 'replit';
  }
  
  // VS Code
  if (env.TERM_PROGRAM === 'vscode') {
    return 'vscode';
  }
  
  return 'generic-web-ide';
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTER FOR GOOGLE CLOUD IDE
// ════════════════════════════════════════════════════════════════════════════

function registerGoogleCloudIDE() {
  console.log('📍 Detected: Google Cloud IDE');
  console.log('✅ MCP Server ready for Google Cloud IDE environment');
  console.log('   Use: "MCP: Add Server..." in command palette');
  console.log(`   Command: node ${path.join(__dirname, 'mcp-server.js')}`);
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTER FOR GITPOD
// ════════════════════════════════════════════════════════════════════════════

function registerGitpod() {
  console.log('📍 Detected: Gitpod');
  
  // Create .gitpod.yml if it doesn't exist
  const gitpodConfig = path.join(PROJECT_ROOT, '.gitpod.yml');
  if (!fs.existsSync(gitpodConfig)) {
    const config = `tasks:
  - init: |
      cd code-review-graph
      npm install
      npm run analyze
  - command: |
      cd code-review-graph
      node mcp-server.js

vscode:
  extensions:
    - GitHub.copilot
    - GitHub.copilot-chat

ports:
  - port: 3000
    onOpen: ignore
`;
    fs.writeFileSync(gitpodConfig, config);
    console.log('✅ Created .gitpod.yml for auto-startup');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTER FOR GITHUB CODESPACES
// ════════════════════════════════════════════════════════════════════════════

function registerGitHubCodespaces() {
  console.log('📍 Detected: GitHub Codespaces');
  
  // Create devcontainer.json if it doesn't exist
  const devcontainerDir = path.join(PROJECT_ROOT, '.devcontainer');
  const devcontainerFile = path.join(devcontainerDir, 'devcontainer.json');
  
  if (!fs.existsSync(devcontainerDir)) {
    fs.mkdirSync(devcontainerDir, { recursive: true });
  }
  
  if (!fs.existsSync(devcontainerFile)) {
    const config = {
      name: "Fintrack Dev Container",
      image: "mcr.microsoft.com/devcontainers/javascript-node:18",
      features: {
        "ghcr.io/devcontainers/features/github-cli:1": {}
      },
      postCreateCommand: "cd code-review-graph && npm install && npm run analyze",
      customizations: {
        vscode: {
          extensions: [
            "GitHub.copilot",
            "GitHub.copilot-chat",
            "esbenp.prettier-vscode"
          ]
        }
      },
      forwardPorts: [3000],
      portsAttributes: {
        "3000": {
          "label": "MCP Server",
          "onAutoForward": "ignore"
        }
      }
    };
    
    fs.writeFileSync(devcontainerFile, JSON.stringify(config, null, 2));
    console.log('✅ Created .devcontainer/devcontainer.json');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// REGISTER FOR REPLIT
// ════════════════════════════════════════════════════════════════════════════

function registerReplit() {
  console.log('📍 Detected: Replit');
  
  const replitConfig = path.join(PROJECT_ROOT, '.replit');
  if (!fs.existsSync(replitConfig)) {
    const config = `run = "cd code-review-graph && npm install && npm run analyze && node mcp-server.js"
entrypoint = "code-review-graph/mcp-server.js"

[nix]
channel = "unstable"

[env]
NODE_ENV = "production"

[packager]
language = "nodejs"

[packager.features]
packageSearch = true
`;
    fs.writeFileSync(replitConfig, config);
    console.log('✅ Created .replit for auto-startup');
  }
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN REGISTRATION
// ════════════════════════════════════════════════════════════════════════════

function main() {
  const ide = detectIDE();
  
  console.log(`🌐 IDE Environment: ${ide}\n`);
  
  switch (ide) {
    case 'google-cloud-ide':
      registerGoogleCloudIDE();
      break;
    case 'gitpod':
      registerGitpod();
      break;
    case 'github-codespaces':
      registerGitHubCodespaces();
      break;
    case 'replit':
      registerReplit();
      break;
    case 'vscode':
      console.log('📍 Detected: VS Code');
      console.log('✅ MCP Server configured via .mcp.json');
      break;
    default:
      console.log('📍 Detected: Generic Web IDE');
      console.log('✅ MCP Server manifest available at .mcp-manifest.json');
  }
  
  console.log('\n━'.repeat(50));
  console.log('\n✅ MCP Server Registration Complete!\n');
  console.log('📍 Project Root:', PROJECT_ROOT);
  console.log('📍 Server Location:', path.join(__dirname, 'mcp-server.js'));
  console.log('📍 Graph Data:', path.join(__dirname, 'graph-data.json'));
  console.log('\n💡 To use the MCP server:');
  console.log('   1. Install dependencies: npm install');
  console.log('   2. Analyze codebase: npm run analyze');
  console.log('   3. IDE will auto-discover the MCP server');
  console.log('\n');
}

main();
