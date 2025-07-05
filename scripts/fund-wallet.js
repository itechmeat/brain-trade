#!/usr/bin/env node

import { ethers } from 'ethers';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

async function fundWallet(targetAddress, ethAmount = '0.01') {
  try {
    // Setup provider
    const provider = new ethers.JsonRpcProvider(process.env.ZIRCUIT_RPC_URL);

    // Get source wallet from private key
    const sourceWallet = new ethers.Wallet(process.env.ZIRCUIT_PRIVATE_KEY, provider);
    console.log('Source wallet address:', sourceWallet.address);
    console.log('Target wallet address:', targetAddress);

    // Check source balance
    const sourceBalance = await provider.getBalance(sourceWallet.address);
    console.log('Source ETH balance:', ethers.formatEther(sourceBalance), 'ETH');

    const ethToSend = ethers.parseEther(ethAmount);

    if (sourceBalance < ethToSend) {
      console.log('❌ Insufficient ETH in source wallet');
      return;
    }

    // Check target balance before transfer
    const targetBalanceBefore = await provider.getBalance(targetAddress);
    console.log('Target ETH balance before:', ethers.formatEther(targetBalanceBefore), 'ETH');

    // Transfer ETH
    console.log(`Transferring ${ethAmount} ETH...`);
    const tx = await sourceWallet.sendTransaction({
      to: targetAddress,
      value: ethToSend,
    });

    console.log('Transaction hash:', tx.hash);
    const receipt = await tx.wait();
    console.log('✅ Transfer completed in block', receipt.blockNumber);

    // Check new balance
    const targetBalanceAfter = await provider.getBalance(targetAddress);
    console.log('Target ETH balance after:', ethers.formatEther(targetBalanceAfter), 'ETH');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Get target address from command line or use MetaMask address
const targetAddress = process.argv[2] || '0x7baf1f7b8e1423ec8856e8155313a4c79a58efae';
const ethAmount = process.argv[3] || '0.01';

console.log('🚀 Funding wallet...');
fundWallet(targetAddress, ethAmount);
