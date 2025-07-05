/**
 * Simple deployment script for Zircuit testnet
 */

import hre from "hardhat";

async function main() {
  console.log('🚀 Starting deployment...');
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log('💰 Account balance:', hre.ethers.formatEther(balance), 'ETH');
  
  if (balance < hre.ethers.parseEther('0.001')) {
    console.error('❌ Insufficient balance for deployment. Need at least 0.001 ETH');
    console.log('💡 Get testnet ETH from: https://faucet.zircuit.com/');
    return;
  }
  
  // Deploy ExpertFactory
  console.log('\n📦 Deploying ExpertFactory...');
  
  const ExpertFactory = await hre.ethers.getContractFactory("ExpertFactory");
  const platformAddress = deployer.address; // Platform gets fees
  
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
      expertAddress: deployer.address, // Use deployer as expert address
    },
    {
      name: 'Peter Thiel', 
      symbol: 'btTHIEL',
      category: 'Innovation',
      tokensPerQuery: 20,
      expertAddress: deployer.address,
    },
    {
      name: 'Steve Blank',
      symbol: 'btBLANK', 
      category: 'Lean Startup',
      tokensPerQuery: 10,
      expertAddress: deployer.address,
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
  
  // Save deployment info
  console.log('\n💾 Saving deployment info...');
  
  const deploymentInfo = {
    network: 'zircuit-testnet',
    expertFactory: factoryAddress,
    platformAddress: platformAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
    chainId: (await deployer.provider.getNetwork()).chainId.toString()
  };
  
  const fs = await import('fs');
  const path = await import('path');
  const { fileURLToPath } = await import('url');
  
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'zircuit-testnet.json'),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log('✅ Deployment complete!');
  console.log('\n📋 Next steps:');
  console.log('1. Add to your .env.local:');
  console.log(`   NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log('2. Restart your dev server');
  console.log('3. Test real blockchain transactions!');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });