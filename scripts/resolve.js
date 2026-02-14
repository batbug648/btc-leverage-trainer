const hre = require("hardhat");

async function main() {
  const contractAddress = "0x3E2f3FBC78bF575DC2E2CBF45eD7B48dCc3F4751";
  const btcClosePrice = 106150
;
  
  const btcPriceInCents = Math.floor(btcClosePrice * 100);

  console.log("🔄 Resolving current day...");
  console.log("BTC Close Price: $" + btcClosePrice.toLocaleString());
  
  const BTCLeverageTrainer = await hre.ethers.getContractFactory("BTCLeverageTrainer");
  const trainer = BTCLeverageTrainer.attach(contractAddress);

  const tx = await trainer.resolveDay(btcPriceInCents);
  console.log("Transaction:", tx.hash);
  await tx.wait();
  
  console.log("✅ Day resolved! Users can now close positions!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
