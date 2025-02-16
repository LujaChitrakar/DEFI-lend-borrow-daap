require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  // etherscan: {
  //   apiKey: {
  //     sepolia: process.env.ETHERSCAN_API_KEY || "",
  //   },
  // },
  // gasReporter: {
  //   enabled: process.env.REPORT_GAS ? true : false,
  //   currency: "USD",
  //   coinmarketcap: process.env.COINMARKETCAP_API_KEY || "",
  //   outputFile: "gas-report.txt",
  //   noColors: true,
  // },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  mocha: {
    timeout: 300000, // 5 minutes
  },
  // paths: {
  //   artifacts: "./artifacts",
  //   cache: "./cache",
  //   sources: "./contracts",
  //   tests: "./test",
  // },
};
