/**
 * Token Management Page
 *
 * This page allows users to view their expert token balances,
 * purchase new tokens, and manage their blockchain interactions.
 */

'use client';

import React from 'react';
import { TokenBalanceDashboard } from '@/components/blockchain/TokenBalance';

export default function TokensPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">🪙 Expert Token Management</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Purchase expert tokens to access AI consultations. Each expert has their own token with
            different consultation costs.
          </p>
        </div>

        <TokenBalanceDashboard />

        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">💡 How Expert Tokens Work</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">Purchase Tokens</h3>
              <p className="text-gray-600">
                Buy expert tokens with ETH. Each expert has different pricing based on their
                expertise level.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-lg font-semibold mb-2">Start Consultations</h3>
              <p className="text-gray-600">
                Use tokens to access AI-powered consultations. Tokens are spent when you ask
                questions.
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl mb-3">📈</div>
              <h3 className="text-lg font-semibold mb-2">Support Experts</h3>
              <p className="text-gray-600">
                90% of consultation fees go directly to experts, creating a sustainable knowledge
                economy.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🚀 Available Expert Tokens</h3>
          <div className="space-y-2 text-blue-800">
            <div>
              <strong>btBEN</strong> - Ben Horowitz: 15 tokens per consultation (Strategic
              Leadership)
            </div>
            <div>
              <strong>btTHIEL</strong> - Peter Thiel: 20 tokens per consultation (Contrarian
              Innovation)
            </div>
            <div>
              <strong>btBLANK</strong> - Steve Blank: 10 tokens per consultation (Lean Startup)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
