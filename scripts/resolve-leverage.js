const hre = require("hardhat");
const fs = require('fs');

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log("Usage: npx hardhat run scripts/resolve-leverage.js --network fuji -- <btc_price>");
    process.exit(1);
  }

  const btcPrice = parseFloat(args[0]);
  const btcPriceInCents = Math.floor(btcPrice * 100);

  console.log("📊 Resolving BTC Leverage Trading Day");
  console.log("Network:", hre.network.name);
  console.log("BTC Close Price: $" + btcPrice.toLocaleString());
  console.log("");

  const contractAddress = "0x0cCd25D6Fff08f2443089c7A230415a0721296B3";
  const BTCLeverageTrainer = await hre.ethers.getContractFactory("BTCLeverageTrainer");
  const trainer = BTCLeverageTrainer.attach(contractAddress);

  const todayMarket = await trainer.getTodayMarket();
  const startPrice = Number(todayMarket[1]) / 100;
  
  console.log("Start Price: $" + startPrice.toLocaleString());
  
  const priceChange = btcPrice - startPrice;
  const priceChangePercent = ((priceChange / startPrice) * 100);
  
  console.log("Change:", (priceChange >= 0 ? "+" : "") + priceChangePercent.toFixed(2) + "%");
  console.log("");

  console.log("Resolving and starting new day...");
  const tx = await trainer.resolveAndStartNewDay(btcPriceInCents);
  await tx.wait();
  
  console.log("✅ Day resolved!");
  console.log("Users can now close positions and see their P&L!");
}

main().then(() => process.exit(0)).catch((error) => {
  console.error(error);
  process.exit(1);
});
