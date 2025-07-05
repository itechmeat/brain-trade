import { ethers } from 'ethers';
import { config } from 'dotenv';
import fs from 'fs';

config();

/**
 * Deploy ExpertFactory and ExpertTokens to Zircuit testnet
 * FINAL VERSION - deploys contracts with correct token amounts in wei format
 */
async function deployContracts() {
  try {
    console.log('🚀 Deploying ExpertFactory and ExpertTokens to Zircuit testnet...');

    // Setup provider and wallet
    const provider = new ethers.JsonRpcProvider(
      process.env.ZIRCUIT_RPC_URL || 'https://zircuit-garfield-testnet.drpc.org'
    );

    if (!process.env.ZIRCUIT_PRIVATE_KEY) {
      throw new Error('❌ ZIRCUIT_PRIVATE_KEY not found in .env.local');
    }

    const wallet = new ethers.Wallet(process.env.ZIRCUIT_PRIVATE_KEY, provider);
    console.log('📝 Deploying from:', wallet.address);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'ETH');

    if (balance < ethers.parseEther('0.01')) {
      throw new Error('❌ Insufficient balance. Need at least 0.01 ETH for deployment');
    }

    // Load compiled contract artifacts
    const factoryArtifact = JSON.parse(
      fs.readFileSync('./artifacts/contracts/ExpertFactory.sol/ExpertFactory.json', 'utf8')
    );

    // Deploy ExpertFactory
    console.log('\n📦 Deploying ExpertFactory...');
    const factory = new ethers.ContractFactory(
      factoryArtifact.abi,
      factoryArtifact.bytecode,
      wallet
    );

    const contract = await factory.deploy(wallet.address);
    await contract.waitForDeployment();

    const factoryAddress = await contract.getAddress();
    console.log('✅ ExpertFactory deployed to:', factoryAddress);

    // Create experts with CORRECT token amounts (in wei format)
    console.log('\n👥 Creating experts...');
    
    /**
     * CRITICAL: Using ethers.parseEther() to convert token amounts to wei
     * 
     * WHY THIS IS ESSENTIAL:
     * - ERC-20 tokens work in wei format (18 decimal places)
     * - ethers.parseEther('15') = 15000000000000000000 wei = 15 tokens
     * - If we passed raw 15, it would be 15 wei = 0.000000000000000015 tokens
     * - This ensures users pay 15 full tokens, not microscopic amounts
     */
    const experts = [
      {
        name: 'Ben Horowitz',
        symbol: 'btBEN',
        category: 'Venture Capital',
        tokensPerQuery: ethers.parseEther('15'), // 15 tokens in wei format
        expertAddress: wallet.address
      },
      {
        name: 'Peter Thiel',
        symbol: 'btTHIEL',
        category: 'Innovation',
        tokensPerQuery: ethers.parseEther('20'), // 20 tokens in wei format
        expertAddress: wallet.address
      },
      {
        name: 'Steve Blank',
        symbol: 'btBLANK',
        category: 'Lean Startup',
        tokensPerQuery: ethers.parseEther('10'), // 10 tokens in wei format
        expertAddress: wallet.address
      }
    ];

    const deployedExperts = [];

    for (const expert of experts) {
      console.log(`Creating ${expert.name} (cost: ${ethers.formatEther(expert.tokensPerQuery)} tokens)...`);
      
      try {
        const tx = await contract.createExpert(
          expert.name,
          expert.symbol,
          expert.category,
          expert.tokensPerQuery,
          expert.expertAddress
        );
        
        const receipt = await tx.wait();
        console.log(`✅ ${expert.name} created! Gas used: ${receipt.gasUsed.toString()}`);
        
        // Get token address from event
        const expertCreatedEvent = receipt.logs.find(
          log => log.topics[0] === contract.interface.getEvent('ExpertCreated').topicHash
        );
        
        if (expertCreatedEvent) {
          const decodedEvent = contract.interface.decodeEventLog(
            'ExpertCreated',
            expertCreatedEvent.data,
            expertCreatedEvent.topics
          );
          
          deployedExperts.push({
            name: expert.name,
            symbol: expert.symbol,
            tokenAddress: decodedEvent.tokenAddress,
            consultationCost: ethers.formatEther(expert.tokensPerQuery)
          });
          
          console.log(`   Token address: ${decodedEvent.tokenAddress}`);
        }
        
      } catch (error) {
        console.error(`❌ Failed to create ${expert.name}:`, error.message);
      }
    }

    // Save deployment info
    console.log('\n💾 Saving deployment info...');
    
    const deploymentInfo = {
      network: 'zircuit-testnet',
      chainId: (await provider.getNetwork()).chainId.toString(),
      expertFactory: factoryAddress,
      platformAddress: wallet.address,
      deployedAt: new Date().toISOString(),
      deployer: wallet.address,
      experts: deployedExperts,
      note: 'Production deployment with correct token amounts in wei format'
    };

    // Create deployments directory
    const deploymentsDir = './deployments';
    if (!fs.existsSync(deploymentsDir)) {
      fs.mkdirSync(deploymentsDir);
    }

    // Save deployment file
    fs.writeFileSync(
      `${deploymentsDir}/zircuit-testnet.json`,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log('✅ Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Add to your .env.local:');
    console.log(`   NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS=${factoryAddress}`);
    console.log('2. Restart your development server');
    console.log('3. Test blockchain functionality including tips!');
    
    console.log('\n🎯 Expert tokens deployed:');
    deployedExperts.forEach(expert => {
      console.log(`  ${expert.name} (${expert.symbol}): ${expert.consultationCost} tokens per consultation`);
      console.log(`    Token contract: ${expert.tokenAddress}`);
    });
    
    return {
      success: true,
      factoryAddress: factoryAddress,
      experts: deployedExperts
    };

  } catch (error) {
    console.error('💥 Deployment failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

// Run deployment
deployContracts().then(result => {
  if (result.success) {
    console.log('\n🎉 Deployment completed successfully!');
    console.log('🚀 Ready to test with real blockchain!');
    process.exit(0);
  } else {
    console.log('\n💥 Deployment failed!');
    process.exit(1);
  }
});