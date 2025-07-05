#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function checkBalance() {
  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.ZIRCUIT_RPC_URL);

    // Get wallet from private key
    const wallet = new ethers.Wallet(process.env.ZIRCUIT_PRIVATE_KEY, provider);
    console.log('Wallet address:', wallet.address);

    // Contract addresses
    const tokenAddresses = {
      btBEN: '0x620E0e8542F8E3d60409C647C2bC52F086b17599',
      btTHIEL: '0x9EfD3a9Dac62651d9AA9980B7580F88943D9EE14',
      btBLANK: '0xddb3078f9Ed4fDeE8b0Fa85b249871a3E80d76D4',
    };

    // ERC20 ABI for balanceOf
    const erc20Abi = [
      'function balanceOf(address owner) view returns (uint256)',
      'function symbol() view returns (string)',
      'function name() view returns (string)',
    ];

    console.log('\n=== Token Balances ===');

    for (const [symbol, address] of Object.entries(tokenAddresses)) {
      const tokenContract = new ethers.Contract(address, erc20Abi, provider);

      try {
        const balance = await tokenContract.balanceOf(wallet.address);
        const name = await tokenContract.name();

        console.log(`${symbol}:`);
        console.log(`  Address: ${address}`);
        console.log(`  Name: ${name}`);
        console.log(`  Balance: ${balance.toString()}`);
        console.log(`  Formatted: ${ethers.formatEther(balance)}`);
        console.log('');
      } catch (error) {
        console.log(`${symbol}: Error - ${error.message}`);
      }
    }

    // Check ETH balance
    const ethBalance = await provider.getBalance(wallet.address);
    console.log('ETH Balance:', ethers.formatEther(ethBalance));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkBalance();
