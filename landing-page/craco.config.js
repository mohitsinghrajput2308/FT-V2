// craco.config.js
require('node:dns').setDefaultResultOrder('ipv4first');
const path = require("path");
require("dotenv").config();

// Check if we're in development/preview mode (not production build)
// Craco sets NODE_ENV=development for start, NODE_ENV=production for build
const isDevServer = process.env.NODE_ENV !== "production";

// Environment variable overrides
const config = {
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
  enableVisualEdits: isDevServer, // Only enable during dev server
};

// Conditionally load visual edits modules only in dev mode
let setupDevServer;
let babelMetadataPlugin;

if (config.enableVisualEdits) {
  setupDevServer = require("./plugins/visual-edits/dev-server-setup");
  babelMetadataPlugin = require("./plugins/visual-edits/babel-metadata-plugin");
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  eslint: {
    configure: {
      extends: ["plugin:react-hooks/recommended"],
      rules: {
        "react-hooks/rules-of-hooks": "error",
        "react-hooks/exhaustive-deps": "warn",
      },
    },
  },
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig) => {

      // Add ignored patterns to reduce watched directories
      webpackConfig.watchOptions = {
        ...webpackConfig.watchOptions,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/build/**',
          '**/dist/**',
          '**/coverage/**',
          '**/public/**',
        ],
      };

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }
      return webpackConfig;
    },
  },
};

// Only add babel metadata plugin during dev server
if (config.enableVisualEdits && babelMetadataPlugin) {
  webpackConfig.babel = {
    plugins: [babelMetadataPlugin],
  };
}

webpackConfig.devServer = (devServerConfig) => {
  // Apply visual edits dev server setup only if enabled
  if (config.enableVisualEdits && setupDevServer) {
    devServerConfig = setupDevServer(devServerConfig);
  }

  // Setup middlewares for health checks and local API endpoints
  const originalSetupMiddlewares = devServerConfig.setupMiddlewares;
  devServerConfig.setupMiddlewares = (middlewares, devServer) => {
    if (originalSetupMiddlewares) {
      middlewares = originalSetupMiddlewares(middlewares, devServer);
    }

    if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
      setupHealthEndpoints(devServer, healthPluginInstance);
    }

    // Local dev API endpoints for Yahoo Finance (to match Vercel serverless)
    devServer.app.get('/api/quote', async (req, res) => {
      const symbols = req.query.symbols;
      if (!symbols) return res.status(400).json({ error: 'Missing symbols' });
      try {
        const YF = require('yahoo-finance2').default;
        const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });
        const symbolArray = symbols.split(',').map(s => s.trim());
        let quotes;
        try {
          quotes = await yahooFinance.quote(symbolArray);
        } catch (e) {
          if (e.name === 'FailedYahooValidationError') {
            quotes = e.result;
          } else {
            throw e;
          }
        }
        res.status(200).json({ quoteResponse: { result: Array.isArray(quotes) ? quotes : [quotes] } });
      } catch (error) {
        console.error('Yahoo Quote Error:', error);
        res.status(500).json({ error: 'Failed to fetch quote', details: error.message });
      }
    });

    devServer.app.get('/api/search', async (req, res) => {
      const q = req.query.q;
      if (!q) return res.status(400).json({ error: 'Missing query' });
      try {
        const YF = require('yahoo-finance2').default;
        const yahooFinance = new YF({ suppressNotices: ['yahooSurvey'] });
        const results = await yahooFinance.search(q, { quotesCount: 10, newsCount: 0 });
        res.status(200).json(results);
      } catch (error) {
        console.error('Yahoo Search Error:', error);
        res.status(500).json({ error: 'Failed to fetch search', details: error.message });
      }
    });

    return middlewares;
  };

  // Add proxy to bypass CORS for Yahoo Finance API
  devServerConfig.proxy = [
    {
      context: ['/api/yahoo'],
      target: 'https://query1.finance.yahoo.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api/yahoo': '' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('Origin', 'https://finance.yahoo.com');
          proxyReq.setHeader('Referer', 'https://finance.yahoo.com/');
          proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        }
      }
    },
    {
      context: ['/api/yahoo2'],
      target: 'https://query2.finance.yahoo.com',
      changeOrigin: true,
      secure: false,
      pathRewrite: { '^/api/yahoo2': '' },
      on: {
        proxyReq: (proxyReq) => {
          proxyReq.setHeader('Origin', 'https://finance.yahoo.com');
          proxyReq.setHeader('Referer', 'https://finance.yahoo.com/');
          proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
        }
      }
    }
  ];

  return devServerConfig;
};

module.exports = webpackConfig;
