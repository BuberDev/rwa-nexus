import { ethers, network } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying to ${network.name} with account: ${deployer.address}`);
  console.log(`Balance: ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);

  // Deploy RWARegistry
  const RegistryFactory = await ethers.getContractFactory("RWARegistry");
  const registry = await RegistryFactory.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log(`RWARegistry deployed to: ${registryAddress}`);

  // Register a demo asset
  const tx = await registry.registerAsset(
    "Warsaw Prime Office",
    "WPO",
    0, // RealEstate
    ethers.parseEther("25000000"),
    "bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi"
  );
  const receipt = await tx.wait();
  console.log(`Demo asset registered — tx: ${receipt?.hash}`);

  console.log("\n--- Deployment Summary ---");
  console.log(`Network:     ${network.name}`);
  console.log(`Registry:    ${registryAddress}`);
  console.log(`Deployer:    ${deployer.address}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
