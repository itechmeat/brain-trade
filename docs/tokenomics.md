# BrainTrade Tokenomics - Simplified Hackathon Version

## Overview

This document describes the actual token economics implementation for the BrainTrade hackathon version. This is a simplified version of the full tokenomics described in `about.md`.

## Key Differences from Full Vision

| Aspect | Full Vision (about.md) | Hackathon Implementation |
|--------|------------------------|--------------------------|
| Purchase Currency | USDT | ETH |
| Revenue Currency | USDT | Expert Tokens |
| Price Stability | Stable (USDT-based) | Volatile (ETH-based) |
| Complexity | Full DeFi integration | Simplified for demo |

## Token Economics

### Expert Token Creation

Each expert gets their own ERC-20 token with format `bt{NAME}`:
- **btBEN** - Ben Horowitz tokens
- **btTHIEL** - Peter Thiel tokens  
- **btBLANK** - Steve Blank tokens

### Token Pricing Structure

#### Purchase Rate (Simplified)
```
1 ETH = X Expert Tokens
```
- Rate determined by contract owner
- For demo: approximately 1000 tokens per reasonable ETH amount
- No dynamic pricing in hackathon version

#### Consultation Costs

Defined in `src/data/investment_experts.json`:

```json
{
  "token": "btTHIEL",
  "tokenPrice": 1000,           // Tokens per 1 USDT (reference only)
  "costPerQuery": 0.002,        // USD equivalent (reference only)
  "tokensPerQuery": 20          // ACTUAL cost in expert tokens
}
```

**Current Expert Pricing:**
- **Ben Horowitz (btBEN)**: 15 tokens per query
- **Peter Thiel (btTHIEL)**: 20 tokens per query (premium)
- **Steve Blank (btBLANK)**: 10 tokens per query (budget)

### Transaction Flow

#### 1. Token Purchase
```
User → sends ETH → ExpertToken.purchaseTokens() → receives expert tokens
```

#### 2. Consultation Process
```
User → ExpertToken.startConsultation() → tokens held in contract
AI Response Generated → ExpertToken.completeConsultation() → revenue distribution
```

#### 3. Revenue Distribution
```
Consultation Cost: 20 tokens
├── Expert (90%): 18 tokens
└── Platform (10%): 2 tokens
```

## Smart Contract Architecture

### ExpertToken.sol
- **Purpose**: Individual ERC-20 token for each expert
- **Key Functions**:
  - `purchaseTokens()` - Buy tokens with ETH
  - `startConsultation()` - Begin AI chat (spend tokens)
  - `completeConsultation()` - Finish chat (distribute revenue)
  - `getExpertInfo()` - Get expert metadata

### ExpertFactory.sol (Planned)
- **Purpose**: Deploy new expert tokens automatically
- **Key Functions**:
  - `createExpert()` - Deploy new ExpertToken contract
  - `getExpertTokens()` - List all expert tokens
  - `updateExpertConfig()` - Modify expert parameters

## Configuration Management

### Expert Configuration
All expert settings stored in `src/data/investment_experts.json`:

```json
{
  "name": "Peter Thiel",
  "token": "btTHIEL",
  "tokensPerQuery": 20,
  "costPerQuery": 0.002,    // Reference only
  "tokenPrice": 1000        // Reference only
}
```

### Pricing Flexibility
- Each expert can have different `tokensPerQuery`
- Easy to add new experts by updating JSON
- No smart contract redeployment needed for price changes
- Premium experts charge more tokens

## Implementation Status

### ✅ Completed
- [x] ExpertToken.sol contract with full functionality
- [x] Expert configuration in JSON with token costs
- [x] Revenue distribution mechanism (90/10 split)
- [x] Token purchase with ETH
- [x] Consultation flow (start/complete)

### 🔄 In Progress  
- [ ] ExpertFactory.sol for automatic deployment
- [ ] Frontend integration with contracts
- [ ] Token balance display and management

### 🚀 Future Enhancements
- [ ] USDT integration for stable pricing
- [ ] Dynamic pricing based on demand
- [ ] Secondary market for expert tokens
- [ ] Cross-chain token bridges via LayerZero

## Economic Examples

### Example 1: Ben Horowitz Consultation
```
User has: 100 btBEN tokens
Consultation cost: 15 tokens
After consultation:
├── User balance: 85 btBEN tokens
├── Ben receives: 13.5 tokens (90%)
└── Platform receives: 1.5 tokens (10%)
```

### Example 2: Token Purchase
```
User sends: 0.01 ETH
Contract rate: 100,000 tokens per ETH
User receives: 1,000 btTHIEL tokens
Can afford: 50 consultations (1000 ÷ 20)
```

## Technical Notes

### Gas Optimization
- Single contract per expert (not factory pattern initially)
- Minimal state changes during consultations
- Batch operations where possible

### Security Considerations
- Only contract owner can complete consultations
- Expert address can update consultation costs
- Platform fee hardcoded (10%) for simplicity

### Testing Strategy
- Unit tests for each contract function
- Integration tests for full consultation flow
- Frontend integration testing with testnet

## Migration Path to Full Version

When moving from hackathon to production:

1. **Add USDT Integration**
   - Replace ETH purchases with USDT
   - Implement stablecoin revenue distribution
   
2. **Dynamic Pricing**
   - Oracle integration for ETH/USD rates
   - Supply/demand based token pricing
   
3. **Advanced Features**
   - Token staking mechanisms
   - Expert reputation systems
   - Governance token for platform decisions

## Summary

The hackathon version provides all core functionality while maintaining simplicity:
- ✅ Expert-specific tokens (btBEN, btTHIEL, btBLANK)
- ✅ Flexible pricing per expert
- ✅ Revenue distribution to experts
- ✅ ETH-based purchases (simplified)
- ✅ AI consultation token spending

This foundation can be extended to the full USDT-based vision described in `about.md` after successful hackathon demonstration.