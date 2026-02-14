const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Avalanche Predictions to", hre.network.name);
  console.log("================================================");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "AVAX");
  console.log("");

  // Deploy PredictionCore
  console.log("📝 Deploying PredictionCore...");
  const PredictionCore = await hre.ethers.getContractFactory("PredictionCore");
  const predictionCore = await PredictionCore.deploy();
  await predictionCore.waitForDeployment();
  const predictionCoreAddress = await predictionCore.getAddress();
  console.log("✅ PredictionCore deployed to:", predictionCoreAddress);
  console.log("");

  // Deploy AchievementNFT
  console.log("🏆 Deploying AchievementNFT...");
  const AchievementNFT = await hre.ethers.getContractFactory("AchievementNFT");
  const achievementNFT = await AchievementNFT.deploy();
  await achievementNFT.waitForDeployment();
  const achievementNFTAddress = await achievementNFT.getAddress();
  console.log("✅ AchievementNFT deployed to:", achievementNFTAddress);
  console.log("");

  // Deploy Leaderboard
  console.log("🏅 Deploying Leaderboard...");
  const Leaderboard = await hre.ethers.getContractFactory("Leaderboard");
  const leaderboard = await Leaderboard.deploy();
  await leaderboard.waitForDeployment();
  const leaderboardAddress = await leaderboard.getAddress();
  console.log("✅ Leaderboard deployed to:", leaderboardAddress);
  console.log("");

  // Set up contract connections
  console.log("🔗 Setting up contract connections...");
  await achievementNFT.setPredictionContract(predictionCoreAddress);
  console.log("✅ AchievementNFT connected to PredictionCore");
  
  await leaderboard.setPredictionContract(predictionCoreAddress);
  console.log("✅ Leaderboard connected to PredictionCore");
  console.log("");

  // Summary
  console.log("================================================");
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("================================================");
  console.log("");
  console.log("📋 Contract Addresses:");
  console.log("PredictionCore:  ", predictionCoreAddress);
  console.log("AchievementNFT:  ", achievementNFTAddress);
  console.log("Leaderboard:     ", leaderboardAddress);
  console.log("");
  console.log("📝 Next Steps:");
  console.log("1. Verify contracts on Snowtrace:");
  console.log("   npx hardhat verify --network", hre.network.name, predictionCoreAddress);
  console.log("   npx hardhat verify --network", hre.network.name, achievementNFTAddress);
  console.log("   npx hardhat verify --network", hre.network.name, leaderboardAddress);
  console.log("");
  console.log("2. Update frontend/.env with these addresses");
  console.log("3. Submit to Retro9000: https://retro9000.avax.network");
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      PredictionCore: predictionCoreAddress,
      AchievementNFT: achievementNFTAddress,
      Leaderboard: leaderboardAddress
    }
  };

  const fs = require('fs');
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("💾 Deployment info saved to deployment-info.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
