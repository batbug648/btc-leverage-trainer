const hre = require("hardhat");

async function main() {
  console.log("Deploying BTC Leverage Trainer...");
  const BTCLeverageTrainer = await hre.ethers.getContractFactory("BTCLeverageTrainer");
  const trainer = await BTCLeverageTrainer.deploy();
  await trainer.waitForDeployment();
  const address = await trainer.getAddress();
  console.log("BTCLeverageTrainer deployed to:", address);
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
