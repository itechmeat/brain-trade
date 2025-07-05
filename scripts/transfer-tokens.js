#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function transferTokens() {
  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.ZIRCUIT_RPC_URL);

    // Get wallet from private key (source wallet)
    const sourceWallet = new ethers.Wallet(process.env.ZIRCUIT_PRIVATE_KEY, provider);
    console.log('Source wallet address:', sourceWallet.address);

    // Target wallet address (Privy wallet from the app)
    const targetAddress = '0x7Fa1B1DeE8F2c1fA58E06B7c0c5289DEBF631f9E';
    console.log('Target wallet address:', targetAddress);

    // Contract addresses
    const tokenAddresses = {
      btBEN: '0x620E0e8542F8E3d60409C647C2bC52F086b17599',
      btTHIEL: '0x9EfD3a9Dac62651d9AA9980B7580F88943D9EE14',
      btBLANK: '0xddb3078f9Ed4fDeE8b0Fa85b249871a3E80d76D4',
    };

    // ERC20 ABI for transfer
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function transfer(address to, uint256 amount) returns (bool)',
      'function symbol() view returns (string)',
      'function name() view returns (string)',
    ];

    console.log('\n=== Transferring Tokens ===');

    for (const [symbol, address] of Object.entries(tokenAddresses)) {
      const tokenContract = new ethers.Contract(address, erc20Abi, sourceWallet);

      try {
        const balance = await tokenContract.balanceOf(sourceWallet.address);
        console.log(`\n${symbol}:`);
        console.log(`  Current balance: ${balance.toString()}`);

        if (balance > 0) {
          console.log(`  Transferring ${balance.toString()} tokens to ${targetAddress}...`);

          const tx = await tokenContract.transfer(targetAddress, balance);
          console.log(`  Transaction hash: ${tx.hash}`);

          const receipt = await tx.wait();
          console.log(`  ✅ Transfer completed in block ${receipt.blockNumber}`);
        } else {
          console.log(`  ⚠️ No tokens to transfer`);
        }
      } catch (error) {
        console.log(`  ❌ Error transferring ${symbol}: ${error.message}`);
      }
    }

    console.log('\n=== Transfer Complete ===');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

transferTokens();
