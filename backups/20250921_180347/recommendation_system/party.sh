#!/bin/bash
# Simple bash script to generate party outfits with camisole

echo "🎉 Generating Party Outfit with Your Camisole!"
echo "=============================================="

cd /Users/mishtyverma/closet-twin-style-3/backend/recommendation_system

python custom_main.py --all --seed "custom_010" --occasion "party" --num-outfits 3

echo ""
echo "✅ Done! Check the data/output folder for your outfit images!"
