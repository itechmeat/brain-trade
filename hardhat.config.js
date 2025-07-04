import { config } from 'dotenv';
config();

/** @type import('hardhat/config').HardhatUserConfig */
const hardhatConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    zircuit: {
      url: process.env.ZIRCUIT_RPC_URL || 'https://zircuit-garfield-testnet.drpc.org',
      chainId: 0xbf02, // 49026 in decimal
      accounts: process.env.ZIRCUIT_PRIVATE_KEY ? [process.env.ZIRCUIT_PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
  },
  sourcify: {
    enabled: true,
    apiUrl: 'https://sourcify.dev/server',
    browserUrl: 'https://repo.sourcify.dev',
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: 'USD',
  },
};

export default hardhatConfig;
