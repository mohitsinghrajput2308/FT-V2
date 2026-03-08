import React, { useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useAuth } from '../../../context/AuthContext';
import { useSubscription } from '../../../hooks/useSubscription';
import UpgradeModal from '../../components/Common/UpgradeModal';

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
    const { upgradeToPro } = useAuth();
    const { isPro, isBusiness, loading } = useSubscription();
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

    // While subscription is loading from cache/network, don't flash the upgrade wall
    if (!loading && !isPro && !isBusiness) {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
                    <p className="text-gray-500 dark:text-gray-400">Integrate FinTrack directly into your apps.</p>
                </div>

                <div className="card p-12 text-center bg-gray-50 dark:bg-dark-300">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Pro Feature: External API Access</h2>
                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
                        Access our powerful REST API to automate entries from other banking platforms or build custom integrations.
                    </p>
                    <button
                        onClick={() => setIsUpgradeModalOpen(true)}
                        className="btn btn-primary"
                    >
                        Upgrade to Pro
                    </button>
                </div>

                <UpgradeModal
                    isOpen={isUpgradeModalOpen}
                    onClose={() => setIsUpgradeModalOpen(false)}
                    onUpgrade={() => {
                        upgradeToPro();
                        setIsUpgradeModalOpen(false);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">API Documentation</h1>
                <p className="text-gray-500 dark:text-gray-400">Integrate FinTrack directly into your apps.</p>
            </div>

            <div className="card bg-white p-6 shadow-sm overflow-hidden" style={{ minHeight: '600px' }}>
                <SwaggerUI spec={swaggerYaml} />
            </div>
        </div>
    );
};

export default ApiDocs;
