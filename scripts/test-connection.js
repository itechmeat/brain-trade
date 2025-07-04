import { ethers } from 'ethers';
import { config } from 'dotenv';

config();

/**
 * Test connection to Zircuit testnet
 */
async function testZircuitConnection() {
  try {
    console.log('🔗 Testing Zircuit testnet connection...');

    // Create provider
    const provider = new ethers.JsonRpcProvider(
      process.env.ZIRCUIT_RPC_URL || 'https://zircuit-garfield-testnet.drpc.org',
    );

    // Get network info
    const network = await provider.getNetwork();
    console.log('✅ Network connected:', {
      name: network.name,
      chainId: network.chainId.toString(),
      hex: `0x${network.chainId.toString(16)}`,
    });

    // Test wallet connection if private key provided
    if (process.env.ZIRCUIT_PRIVATE_KEY) {
      const wallet = new ethers.Wallet(process.env.ZIRCUIT_PRIVATE_KEY, provider);
      const address = wallet.address;
      const balance = await provider.getBalance(address);

      console.log('👛 Wallet info:', {
        address: address,
        balance: ethers.formatEther(balance) + ' ETH',
      });
    } else {
      console.log('⚠️  No private key provided, skipping wallet test');
    }

    // Get latest block
    const blockNumber = await provider.getBlockNumber();
    console.log('📦 Latest block:', blockNumber);

    console.log('🎉 Zircuit testnet connection successful!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testZircuitConnection();
