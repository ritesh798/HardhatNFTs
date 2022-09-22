const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const {
  storeImages,
  storeTokenUriMetadata,
} = require("../utils/uploadToPinata");

const imagesLocation = "./images/randomNft";

const metadataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      trait_types: "Cuteness",
      value: 100,
    },
  ],
};

let tokenUris = [
  "ipfs://QmatVUK3cCKnzzGCoSHR1cfpZSsogJNswwzreCGBWkpYQC",
  "ipfs://QmcXeDtRhi4UmmTm8yqc5DrzKhAypSfymSJ6oMGgy8zZdv",
  "ipfs://QmT9dJD9e9qaSjaZgQ3qtHzPLbNEbtWkDgQ9gRBLxP7PKp",
];

const FUND_AMOUNT = "1000000000000000000000";

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;

  //get Ipfs Hashes of our images
  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenUris = await handleTokenUris();
  }

  let vrfCoordinatorV2Address, subscriptionId;

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2Address = vrfCoordinatorV2Mock.address;
    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
    await vrfCoordinatorV2Mock.fundSubscription(subscriptionId, FUND_AMOUNT);
  } else {
    vrfCoordinatorV2Address = networkConfig[chainId].vrfCoordinatorV2;
    subscriptionId = networkConfig[chainId].subscriptionId;
  }
  log("-----------------------------------------------");

  const args = [
    vrfCoordinatorV2Address,
    subscriptionId,
    networkConfig[chainId].gasLane,
    networkConfig[chainId].callbackGasLimit,

    networkConfig[chainId].mintFee,
    tokenUris,
  ];

  const randomIpfsNft = await deploy("RandomIpfsNft", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log("------------------------------");
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying........");
    await verify(randomIpfsNft.address, args);
  }
};

async function handleTokenUris() {
  tokenUris = [];

  const { responses: imageUploadResponses, files } = await storeImages(
    imagesLocation
  );
  for (imageUploadResponsesIndex in imageUploadResponses) {
    //create metadata
    //upload the metadata
    let tokenUriMetadata = { ...metadataTemplate };
    //pug.png,st-bernard.png
    tokenUriMetadata.name = files[imageUploadResponsesIndex].replace(
      ".png",
      ""
    );
    tokenUriMetadata.description = `An adorable ${tokenUriMetadata.name} pup`;
    tokenUriMetadata.image = `ipfs://${imageUploadResponses[imageUploadResponsesIndex].IpfsHash}`;
    console.log(`uploading ${tokenUriMetadata.name}....`);
    //store the JASON to Pinata .IPFs
    const metadataUplodedResponse = await storeTokenUriMetadata(
      tokenUriMetadata
    );
    tokenUris.push(`ipfs://${metadataUplodedResponse.IpfsHash}`);
  }
  console.log("Token URIs Uploades ! They are:");
  console.log(tokenUris);

  return tokenUris;
}

module.exports.tags = ["all", "randomipfs", "main"];
