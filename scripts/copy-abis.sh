#!/bin/bash

echo "📋 Copying contract ABIs to frontend..."
echo ""

# Check if artifacts exist
if [ ! -d "artifacts/contracts" ]; then
    echo "❌ Error: Contract artifacts not found!"
    echo "   Run 'npm run compile' first to generate contract ABIs."
    exit 1
fi

# Create contracts directory if it doesn't exist
mkdir -p frontend/src/contracts

# Extract and copy ABIs
echo "Extracting PredictionCore ABI..."
jq '.abi' artifacts/contracts/PredictionCore.sol/PredictionCore.json > frontend/src/contracts/PredictionCore.json

echo "Extracting AchievementNFT ABI..."
jq '.abi' artifacts/contracts/AchievementNFT.sol/AchievementNFT.json > frontend/src/contracts/AchievementNFT.json

echo "Extracting Leaderboard ABI..."
jq '.abi' artifacts/contracts/Leaderboard.sol/Leaderboard.json > frontend/src/contracts/Leaderboard.json

echo ""
echo "✅ ABIs copied successfully!"
echo ""
echo "Next steps:"
echo "1. Update frontend/.env with your contract addresses"
echo "2. Run 'cd frontend && npm start' to test the app"
echo ""
