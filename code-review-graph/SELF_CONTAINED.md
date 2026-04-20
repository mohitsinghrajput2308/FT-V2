# ✅ Code Review Graph - Self-Contained Setup

**Everything is in ONE folder: `code-review-graph/`**

```
code-review-graph/
├── mcp-server.js          ← Main MCP server
├── analyze.js             ← Analysis tool
├── register-mcp.js        ← IDE registration
├── manifest.json          ← Package manifest
├── package.json           ← Dependencies
├── graph-data.json        ← Generated analysis
├── .vscode/               ← VS Code config
│   └── settings.json
├── ide-configs/           ← Other IDE configs
│   ├── mcp.json           ← Generic MCP config
│   ├── gitpod.yml         ← Gitpod
│   ├── devcontainer.json  ← GitHub Codespaces
│   ├── google-cloud-ide.json ← Google Cloud IDE
│   └── replit.txt         ← Replit
├── README.md              ← Main docs
├── SETUP.md               ← Quick start
└── .gitignore
```

---

## 🚀 Quick Start (All IDEs)

**Step 1: Navigate to folder**
```bash
cd code-review-graph
```

**Step 2: Install & analyze**
```bash
npm install
npm run analyze
```

**Step 3: Auto-discover**
- MCP server is ready in your IDE

---

## 🔧 IDE-Specific Setup

### VS Code (Local)
1. Open project folder
2. Run: `npm run setup`
3. MCP auto-discovers via `.vscode/settings.json`

### Google Cloud IDE
1. Copy `ide-configs/google-cloud-ide.json`
2. In IDE: Command Palette → `MCP: Add Server`
3. Paste the configuration

### Gitpod
1. Copy `ide-configs/gitpod.yml` to project root as `.gitpod.yml`
2. Push to repo
3. Auto-starts on workspace launch

### GitHub Codespaces
1. Copy `ide-configs/devcontainer.json` to `.devcontainer/devcontainer.json`
2. Push to repo
3. Auto-runs when codespace opens

### Replit
1. Copy `ide-configs/replit.txt` content to `.replit` file
2. Save and push
3. Auto-runs on project open

---

## 📊 Available Commands

```bash
npm run analyze      # Generate code graph
npm run start        # Start MCP server
npm run register     # Register with IDE
npm run setup        # Full setup (install + register + analyze)
```

---

## 📝 Configuration Files

All IDE configs are in `ide-configs/`:

**mcp.json** - Generic MCP configuration
- Copy into your project root as `.mcp.json`
- Or use directly in IDE settings

**google-cloud-ide.json** - Google Cloud IDE MCP config
- Use in: Command Palette → "MCP: Add Server"

**gitpod.yml** - Gitpod auto-setup
- Copy to project root as `.gitpod.yml`

**devcontainer.json** - GitHub Codespaces config
- Copy to project root as `.devcontainer/devcontainer.json`

**replit.txt** - Replit configuration
- Copy to project root as `.replit`

---

## ✨ Self-Contained Benefits

✅ **Everything in one folder** - No files spread across project
✅ **Easy to version control** - Just track `code-review-graph/`
✅ **Portable** - Copy entire folder, it works anywhere
✅ **Clean** - No root-level config clutter
✅ **IDE-agnostic** - Works with any IDE
✅ **Single source of truth** - All configs in one place

---

## 🎯 Usage

Once MCP server is running:

**In Copilot/Claude:**
```
"Based on my code graph: 253 files, 778 symbols, 711 dependencies.
Top functions: handleSubmit (12x), handleChange (10x), closeModal (8x).
Help me optimize..."
```

**What it generates:**
- `graph-data.json` - All analysis results
- Symbol index
- Dependency map
- File statistics

---

## 🐛 Troubleshooting

**MCP not found?**
```bash
cd code-review-graph
npm install
npm run register
```

**Permissions denied?**
- Windows: Run PowerShell as Administrator
- Mac/Linux: `chmod +x mcp-server.js`

**Port conflict?**
- Edit port in `ide-configs/mcp.json`

---

**Everything works from this single folder! 🚀**

See `SETUP.md` for detailed instructions.
