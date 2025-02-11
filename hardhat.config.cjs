require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { SEPOLIA_URL, SEPOLIA_PRIVATE_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: SEPOLIA_URL,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};
