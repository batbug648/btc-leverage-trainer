const hre = require("hardhat");

async function main() {
  // SET THE BTC CLOSE PRICE HERE:
  const btcClosePrice = 97000;  // Change this number each day
  
  const btcPriceInCents = Math.floor(btcClosePrice * 100);

  console.log("📊 Resolving BTC Leverage Trading Day");
  console.log("Network:", hre.network.name);
  console.log("BTC Close Price: $" + btcClosePrice.toLocaleString());
  console.log("");

  const contractAddress = "0x0cCd25D6Fff08f2443089c7A230415a0721296B3";
  const BTCLeverageTrainer = await hre.ethers.getContractFactory("BTCLeverageTrainer");
  const trainer = BTCLeverageTrainer.attach(contractAddress);

  const todayMarket = await trainer.getTodayMarket();
  const startPrice = Number(todayMarket[1]) / 100;
  
  console.log("Start Price: $" + startPrice.toLocaleString());
  
  const priceChange = btcClosePrice - startPrice;
  const priceChangePercent = ((priceChange / startPrice) * 100);
  
  console.log("Change:", (priceChange >= 0 ? "+" : "") + priceChangePercent.toFixed(2) + "%");
  console.log("");

  console.log("🔄 Resolving day...");
  const tx = await trainer.resolveAndStartNewDay(btcPriceInCents);
  console.log("Transaction:", tx.hash);
  await tx.wait();
  
  console.log("✅ Day resolved!");
  console.log("");
  console.log("Users can now:");
  console.log("1. Close yesterday's positions");
  console.log("2. See their P&L");
  console.log("3. Open new positions for today");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
