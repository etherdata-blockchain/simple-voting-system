import { ethers } from "hardhat";

async function main() {
  const Contract = await ethers.getContractFactory("Ballot");
  const contract = await Contract.deploy(3600 * 24 * 31);

  await contract.deployed();
  // 0x8dB14759E151F17849773f829167573657aD8Bb9
  console.log("Contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
