/**
 * Script to deploy contracts and create initial experts
 *
 * Script for deploying contracts and creating initial experts
 */

const { ethers } = require('hardhat');

async function main() {
  console.log('🚀 Starting deployment and expert creation...');

  // Get signer (deployer wallet)
  const [deployer] = await ethers.getSigners();
  console.log('📝 Deploying with account:', deployer.address);
  console.log(
    '💰 Account balance:',
    ethers.formatEther(await deployer.provider.getBalance(deployer.address)),
    'ETH',
  );

  // 1. Deploy ExpertFactory
  console.log('\n📦 Deploying ExpertFactory...');
  const ExpertFactory = await ethers.getContractFactory('ExpertFactory');

  // Platform address (can use deployer address)
  const platformAddress = deployer.address;

  const expertFactory = await ExpertFactory.deploy(platformAddress);
  await expertFactory.waitForDeployment();

  const factoryAddress = await expertFactory.getAddress();
  console.log('✅ ExpertFactory deployed to:', factoryAddress);

  // 2. Create experts
  console.log('\n👥 Creating experts...');

  const experts = [
    {
      name: 'Ben Horowitz',
      symbol: 'btBEN',
      category: 'Venture Capital',
      tokensPerQuery: 15,
      expertAddress: '0x1111111111111111111111111111111111111111', // Placeholder
    },
    {
      name: 'Peter Thiel',
      symbol: 'btTHIEL',
      category: 'Venture Capital',
      tokensPerQuery: 20,
      expertAddress: '0x2222222222222222222222222222222222222222', // Placeholder
    },
    {
      name: 'Steve Blank',
      symbol: 'btBLANK',
      category: 'Lean Startup',
      tokensPerQuery: 10,
      expertAddress: '0x3333333333333333333333333333333333333333', // Placeholder
    },
  ];

  // Create experts one by one
  for (const expert of experts) {
    console.log(`Creating expert: ${expert.name} (${expert.symbol})...`);

    try {
      const tx = await expertFactory.createExpert(
        expert.name,
        expert.symbol,
        expert.category,
        expert.tokensPerQuery,
        expert.expertAddress,
      );

      const receipt = await tx.wait();
      console.log(`✅ ${expert.name} created successfully! Gas used: ${receipt.gasUsed}`);

      // Get token address from event
      const expertCreatedEvent = receipt.logs.find(
        log => log.topics[0] === expertFactory.interface.getEvent('ExpertCreated').topicHash,
      );

      if (expertCreatedEvent) {
        const decodedEvent = expertFactory.interface.decodeEventLog(
          'ExpertCreated',
          expertCreatedEvent.data,
          expertCreatedEvent.topics,
        );
        console.log(`   Token address: ${decodedEvent.tokenAddress}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create ${expert.name}:`, error.message);
    }
  }

  // 3. Alternative method - batch create
  console.log('\n🚀 Alternative: Creating experts in batch...');

  try {
    const names = experts.map(e => e.name);
    const symbols = experts.map(e => e.symbol + '_BATCH'); // Add suffix to avoid conflicts
    const categories = experts.map(e => e.category);
    const tokensPerQuery = experts.map(e => e.tokensPerQuery);
    const expertAddresses = experts.map(e => e.expertAddress);

    const batchTx = await expertFactory.batchCreateExperts(
      names,
      symbols,
      categories,
      tokensPerQuery,
      expertAddresses,
    );

    const batchReceipt = await batchTx.wait();
    console.log(`✅ Batch creation completed! Gas used: ${batchReceipt.gasUsed}`);
  } catch (error) {
    console.error('❌ Batch creation failed:', error.message);
  }

  // 4. Check created experts
  console.log('\n📊 Checking created experts...');

  try {
    const expertCount = await expertFactory.getExpertCount();
    console.log(`Total experts created: ${expertCount}`);

    if (expertCount > 0) {
      const allExperts = await expertFactory.getAllExperts();
      console.log('\nCreated experts:');

      for (let i = 0; i < allExperts.symbols_.length; i++) {
        console.log(`${i + 1}. ${allExperts.names_[i]} (${allExperts.symbols_[i]})`);
        console.log(`   Token: ${allExperts.tokenAddresses_[i]}`);
        console.log(`   Category: ${allExperts.categories_[i]}`);
        console.log(`   Cost: ${allExperts.tokensPerQuery_[i]} tokens`);
        console.log(`   Active: ${allExperts.isActive_[i]}`);
        console.log('');
      }
    }
  } catch (error) {
    console.error('❌ Failed to check experts:', error.message);
  }

  // 5. Save contract addresses
  console.log('\n💾 Saving contract addresses...');

  const deploymentInfo = {
    network: 'zircuit-testnet',
    expertFactory: factoryAddress,
    platformAddress: platformAddress,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const fs = require('fs');
  const path = require('path');

  // Create deployments folder if it doesn't exist
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  // Save deployment information
  const deploymentFile = path.join(deploymentsDir, 'zircuit-testnet.json');
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log('✅ Deployment info saved to:', deploymentFile);

  console.log('\n🎉 Deployment completed!');
  console.log('\n📋 Next steps:');
  console.log('1. Update your .env file:');
  console.log(`   NEXT_PUBLIC_EXPERT_FACTORY_ADDRESS=${factoryAddress}`);
  console.log('2. Restart your development server');
  console.log('3. Visit /tokenized-chat to see your experts!');
}

// Error handling
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('💥 Deployment failed:', error);
    process.exit(1);
  });
