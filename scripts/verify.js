const hre = require("hardhat");
const fs = require('fs');

async function main() {
  console.log("🔍 Verifying contracts on Snowtrace...");
  console.log("================================================");

  // Load deployment info
  const deploymentInfo = JSON.parse(fs.readFileSync('deployment-info.json', 'utf8'));
  
  console.log("Network:", deploymentInfo.network);
  console.log("");

  // Verify PredictionCore
  console.log("Verifying PredictionCore...");
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contracts.PredictionCore,
      constructorArguments: [],
    });
    console.log("✅ PredictionCore verified");
  } catch (error) {
    console.log("⚠️  PredictionCore:", error.message);
  }
  console.log("");

  // Verify AchievementNFT
  console.log("Verifying AchievementNFT...");
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contracts.AchievementNFT,
      constructorArguments: [],
    });
    console.log("✅ AchievementNFT verified");
  } catch (error) {
    console.log("⚠️  AchievementNFT:", error.message);
  }
  console.log("");

  // Verify Leaderboard
  console.log("Verifying Leaderboard...");
  try {
    await hre.run("verify:verify", {
      address: deploymentInfo.contracts.Leaderboard,
      constructorArguments: [],
    });
    console.log("✅ Leaderboard verified");
  } catch (error) {
    console.log("⚠️  Leaderboard:", error.message);
  }
  console.log("");

  console.log("================================================");
  console.log("🎉 Verification complete!");
  console.log("View on Snowtrace:");
  const explorer = deploymentInfo.network === 'mainnet' 
    ? 'https://snowtrace.io' 
    : 'https://testnet.snowtrace.io';
  console.log(`${explorer}/address/${deploymentInfo.contracts.PredictionCore}`);
  console.log(`${explorer}/address/${deploymentInfo.contracts.AchievementNFT}`);
  console.log(`${explorer}/address/${deploymentInfo.contracts.Leaderboard}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
