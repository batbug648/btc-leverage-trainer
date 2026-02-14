const hre = require("hardhat");

async function main() {
  const contractAddress = "0x3E2f3FBC78bF575DC2E2CBF45eD7B48dCc3F4751";
  const btcStartPrice = 96500;
  
  const btcPriceInCents = Math.floor(btcStartPrice * 100);

  console.log("🌅 Starting new trading day...");
  console.log("BTC Start Price: $" + btcStartPrice.toLocaleString());
  
  const BTCLeverageTrainer = await hre.ethers.getContractFactory("BTCLeverageTrainer");
  const trainer = BTCLeverageTrainer.attach(contractAddress);

  const tx = await trainer.startNewDay(btcPriceInCents);
  console.log("Transaction:", tx.hash);
  await tx.wait();
  
  console.log("✅ New day started! Users can now open positions!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
