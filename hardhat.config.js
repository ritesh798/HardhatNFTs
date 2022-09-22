require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");
require("hardhat-deploy");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-contract-sizer");
require("dotenv").config();

const RINKEBY_RPC_URL = process.env.RINKEBY_RPC_URL || "https://eth-rinkeby";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0xkey";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "key";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "key";
const MAINNET_RPC_URL = process.env.MAINNET_RPC_URL;
const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockconfirmations: 1,
      forking: {
        url: MAINNET_RPC_URL,
      },
    },
    localhost: {
      chainId: 31337,
    },

    goerli: {
      url: GOERLI_RPC_URL,
      accounts: [PRIVATE_KEY],

      chainId: 5,
      blockConfirmations: 6,
    },
  },
  etherscan: {
    // yarn hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    apiKey: {
      goerli: ETHERSCAN_API_KEY,
      rinkeby: ETHERSCAN_API_KEY,
    },
  },
  gasReporter: {
    enabled: false,
    outputFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "MATIC",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.7",
      },
      { version: "0.8.0" },
      {
        version: "0.4.24",
      },
      { version: "0.4.19" },
      { version: "0.6.12" },
      { version: "0.6.0" },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    player: {
      default: 1,
    },
  },
  mocha: {
    timeout: 500000,
  },
};
