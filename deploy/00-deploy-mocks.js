const { network } = require("hardhat");
const {
  networkConfig,
  developmentChains,
} = require("../helper-hardhat-config");

const DECIMALS = "18";
const INITIAL_PRICE = "200000000000000000000";

const BASE_FEE = ethers.utils.parseEther("0.25");
const GAS_PRICE_LINK = 1e9; //1000000000

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  const args = [BASE_FEE, GAS_PRICE_LINK];

  if (developmentChains.includes(network.name)) {
    log("Local Network Detected! Deploying mocks");
    //deploy a mock vrfCoordinator...
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: args,
    });
    await deploy("MockV3Aggregator", {
      from: deployer,
      log: true,
      args: [DECIMALS, INITIAL_PRICE],
    });
    log("mocks Deployed.......");
    log("________________________________________");
  }
};

module.exports.tags = ["all", "mocks"];
