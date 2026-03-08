import React from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import './swagger-dark.css';
import { Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '../../../hooks/useSubscription';

// Require the actual swagger file or serve it
// Normally you'd host this yaml publicly or fetch it.
const swaggerYaml = `
openapi: 3.0.0
info:
  title: FinTrack REST API
  description: Public API documentation for integrating external services with your FinTrack account.
  version: 1.0.0
servers:
  - url: https://api.yourdomain.com/v1
    description: Production Server (Coming Soon)
security:
  - bearerAuth: []
paths:
  /transactions:
    get:
      summary: Get all transactions
      description: Retrieve a paginated list of your financial transactions.
      parameters:
        - in: query
          name: type
          schema:
            type: string
          description: Filter by type (income or expense)
      responses:
        '200':
          description: A JSON array of transactions
    post:
      summary: Create a transaction
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                amount:
                  type: number
                type:
                  type: string
                  enum: [income, expense]
                category:
                  type: string
                date:
                  type: string
                  format: date
      responses:
        '201':
          description: Transaction created
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
`;

const ApiDocs = () => {
    const navigate = useNavigate();
    const { isPro, isBusiness, loading } = useSubscription();

    // ── Loading state: show skeleton, never flash SwaggerUI to free users ──
    if (loading) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
                    <p className="text-gray-500 dark:text-gray-400">Integrate FinTrack directly into your apps.</p>
                </div>
                <div className="flex items-center justify-center h-64">
                    <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    // ── Free plan wall ──
    if (!isPro && !isBusiness) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
                    <p className="text-gray-500 dark:text-gray-400">Integrate FinTrack directly into your apps.</p>
                </div>

                <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-400 bg-gray-50 dark:bg-dark-200">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center mb-6 shadow-xl shadow-primary-500/30">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-500 mb-3">Pro Feature</span>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-3">
                        API Access is a Pro Feature
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mb-8">
                        Unlock our full REST API to automate transaction imports, build custom integrations, and connect FinTrack to any external tool or banking platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => navigate('/dashboard/pricing')}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-indigo-600 text-white font-black text-sm hover:from-primary-400 hover:to-indigo-500 transition-all shadow-lg shadow-primary-500/30"
                        >
                            Upgrade to Pro — $9.99/mo
                        </button>
                        <button
                            onClick={() => navigate('/dashboard/pricing')}
                            className="px-8 py-3 rounded-xl border border-gray-200 dark:border-dark-400 text-gray-600 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-dark-300 transition-all"
                        >
                            View All Plans
                        </button>
                    </div>
                    <p className="mt-6 text-xs text-gray-400 dark:text-gray-500">
                        Already upgraded? Refresh the page or sign out and back in.
                    </p>
                </div>
            </div>
        );
    }

    // ── Paid user: render Swagger UI with dark theme ──
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
                <p className="text-gray-500 dark:text-gray-400">Integrate FinTrack directly into your apps.</p>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-dark-400 bg-[#0f172a] overflow-hidden" style={{ minHeight: '600px' }}>
                <SwaggerUI spec={swaggerYaml} />
            </div>
        </div>
    );
};

export default ApiDocs;
