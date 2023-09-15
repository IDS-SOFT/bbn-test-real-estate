
import { ethers } from "hardhat";

const address = "10, Jenson Avenue, NY";
const price = 100000000;

async function main() {

  const deploy_contract = await ethers.deployContract("RealEstateContract", [address, price]);

  await deploy_contract.waitForDeployment();

  console.log("RealEstateContract is deployed to : ",await deploy_contract.getAddress());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
