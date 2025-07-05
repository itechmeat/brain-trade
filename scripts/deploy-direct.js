/**
 * Direct deployment script using ethers.js
 */
import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load compiled contract artifacts
const expertTokenArtifact = JSON.parse(
  readFileSync(join(__dirname, '..', 'artifacts', 'contracts', 'ExpertToken.sol', 'ExpertToken.json'), 'utf-8')
);
const expertFactoryArtifact = JSON.parse(
  readFileSync(join(__dirname, '..', 'artifacts', 'contracts', 'ExpertFactory.sol', 'ExpertFactory.json'), 'utf-8')
);

async function main() {
  console.log('🚀 Starting direct deployment to Zircuit...');
  
  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(process.env.ZIRCUIT_RPC_URL);
  const wallet = new ethers.Wallet(process.env.ZIRCUIT_PRIVATE_KEY, provider);
  
  console.log('📝 Deploying with account:', wallet.address);
  
  // Check balance
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Account balance:', ethers.formatEther(balance), 'ETH');
  
  if (balance < ethers.parseEther('0.001')) {
    console.error('❌ Insufficient balance for deployment. Need at least 0.001 ETH');
    console.log('💡 Get testnet ETH from: https://faucet.zircuit.com/');
    return;
  }
  
  // Deploy ExpertFactory
  console.log('\n📦 Deploying ExpertFactory...');
  
  const ExpertFactory = new ethers.ContractFactory(
    expertFactoryArtifact.abi,
    expertFactoryArtifact.bytecode,
    wallet
  );
  
  const platformAddress = wallet.address; // Platform gets fees
  
  const expertFactory = await ExpertFactory.deploy(platformAddress);
  await expertFactory.waitForDeployment();
  
  const factoryAddress = await expertFactory.getAddress();
  console.log('✅ ExpertFactory deployed to:', factoryAddress);
  
  // Create initial experts
  console.log('\n👥 Creating initial experts...');
  
  const experts = [
    {
      name: 'Ben Horowitz',
      symbol: 'btBEN',
      category: 'Venture Capital',
      tokensPerQuery: 15,
      expertAddress: wallet.address,
    },
    {
      name: 'Peter Thiel', 
      symbol: 'btTHIEL',
      category: 'Innovation',
      tokensPerQuery: 20,
      expertAddress: wallet.address,
    },
    {
      name: 'Steve Blank',
      symbol: 'btBLANK', 
      category: 'Lean Startup',
      tokensPerQuery: 10,
      expertAddress: wallet.address,
    }
  ];
  
  for (const expert of experts) {
    console.log(`Creating ${expert.name}...`);
    
    try {
      const tx = await expertFactory.createExpert(
        expert.name,
        expert.symbol,
        expert.category,
        expert.tokensPerQuery,
        expert.expertAddress
      );
      
      const receipt = await tx.wait();
      console.log(`✅ ${expert.name} created! Gas used:`, receipt.gasUsed.toString());
      
    } catch (error) {
      console.error(`❌ Failed to create ${expert.name}:`, error.message);
    }
  }
  
  console.log('\n✅ Deployment complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Add to your .env file:');
  console.log(`   NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log('2. Restart your dev server');
  console.log('3. Test real blockchain transactions!');
  
  // Save deployment info
  const deploymentInfo = {
    network: 'zircuit-testnet',
    expertFactory: factoryAddress,
    platformAddress: platformAddress,
    deployedAt: new Date().toISOString(),
    deployer: wallet.address,
    chainId: (await provider.getNetwork()).chainId.toString()
  };
  
  console.log('\n📄 Deployment Info:');
  console.log(JSON.stringify(deploymentInfo, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });