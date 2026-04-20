# 🚀 SETUP INSTRUCTIONS

## Step 1: Navigate to the folder

```powershell
cd "c:\Users\KIIT0001\Downloads\Antigravity Projects\Current Money SRC\Fintrack-V1\code-review-graph"
```

## Step 2: Install dependencies

```powershell
npm install
```

## Step 3: Run the analysis

```powershell
npm run analyze
```

## Expected Output

You should see something like:

```
🔍 Analyzing codebase for code review...

📊 ANALYSIS RESULTS:
==================================================

📁 Files by Type:
   .jsx: 45
   .js: 92
   .json: 28
   ...

⬇️  Top 10 Most Imported Modules:
   1. react (45x)
   2. axios (12x)
   3. supabase (8x)
   ...

🔧 Top 10 Most Defined Symbols:
   1. useAuth (8x)
   2. formatDate (5x)
   ...

📈 Summary:
   Total Files: 185
   Total Symbols: 2847
   Total Dependencies: 1203

✅ Analysis complete!
```

## What Gets Created

A new file `graph-data.json` will be created with all the analysis data. This is what you'll use with Copilot for token-efficient code questions.

## How to Use

1. **Keep this graph-data.json file**
2. **Reference it when asking Copilot for code help:**
   - "According to my code graph, I have 185 files and 2,847 symbols..."
   - "Show me files that depend on useAuth"
   - "What's the most common import in my project?"

3. **Update periodically** (weekly or after major changes):
   - Just re-run `npm run analyze`

## Pro Tips

✅ **Before asking Copilot for help:**
- Run the analysis first
- Reference the graph data in your question
- This saves 95% of tokens!

✅ **Example efficient question:**
```
Based on my code-review-graph (185 files, 2847 symbols):
- Top imports: react (45x), axios (12x)
- Most common symbol: useAuth (8x)

How can I optimize these common dependencies?
```

Instead of inefficient question:
```
[Pasting all 500+ files worth of code]
Help me review my codebase...
```

## Troubleshooting

**Issue**: npm not found
- **Solution**: Install Node.js from https://nodejs.org/

**Issue**: Permission denied
- **Solution**: Run PowerShell as Administrator, or use:
  ```powershell
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```

**Issue**: No graph-data.json created
- **Check**: Look at console output for errors
- **Try**: Run `node mcp-server.js` directly to see errors

---

That's it! You're ready to analyze your codebase with token efficiency! 🎉
