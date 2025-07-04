# BrainTrade - Decentralized AI Expert Marketplace

A decentralized marketplace for AI experts with token-gated knowledge on Zircuit blockchain.

## Tech Stack

- **Frontend**: Next.js 15 + TypeScript + SCSS
- **Blockchain**: Zircuit L2 + Hardhat
- **Authentication**: Privy Embedded Wallets
- **AI**: OpenAI/Gemini via OpenRouter
- **Vector DB**: Qdrant for RAG system

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env` and fill in your keys:

```bash
# Required for blockchain development
ZIRCUIT_RPC_URL=https://zircuit-garfield-testnet.drpc.org
ZIRCUIT_PRIVATE_KEY=your_private_key_here

# Required for AI features
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_API_KEY=your_openrouter_key

# Required for authentication
NEXT_PUBLIC_PRIVY_CLIENT_ID=your_privy_client_id
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

### 3. Test Blockchain Connection

Test your Zircuit testnet connection:

```bash
node scripts/test-connection.js
```

Expected output:

```
🔗 Testing Zircuit testnet connection...
✅ Network connected: { name: 'unknown', chainId: '48898', hex: '0xbf02' }
👛 Wallet info: { address: '0x...', balance: '0.05 ETH' }
📦 Latest block: 5657181
🎉 Zircuit testnet connection successful!
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3200](http://localhost:3200) with your browser.

## Blockchain Development

### Get Testnet Tokens

1. Add Zircuit testnet to MetaMask:
   - **Network Name**: Zircuit Garfield Testnet
   - **RPC URL**: https://zircuit-garfield-testnet.drpc.org
   - **Chain ID**: 48898 (0xbf02)
   - **Currency**: ETH

2. Get test tokens from Zircuit faucet

### Export Private Key

1. MetaMask → Account Details → Show Private Key
2. Add to `.env` as `ZIRCUIT_PRIVATE_KEY`
3. **⚠️ Use separate wallet for development**

### Test Connection

```bash
# Test blockchain connection
node scripts/test-connection.js

# Check Hardhat config
npx hardhat --help
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
