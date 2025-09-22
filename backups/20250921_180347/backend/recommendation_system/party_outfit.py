#!/usr/bin/env python3
"""
Simple script to generate party outfits with camisole (custom_010)
"""

import subprocess
import sys
import os

def main():
    print("🎉 Generating Party Outfit with Your Camisole!")
    print("=" * 50)
    
    # Change to the correct directory
    os.chdir('/Users/mishtyverma/closet-twin-style-3/backend/recommendation_system')
    
    # Run the command
    cmd = [
        'python', 'custom_main.py', 
        '--all',
        '--seed', 'custom_010',  # Your camisole
        '--occasion', 'party',
        '--num-outfits', '3'
    ]
    
    print("Running: python custom_main.py --all --seed custom_010 --occasion party --num-outfits 3")
    print("-" * 50)
    
    try:
        subprocess.run(cmd, check=True)
        print("\n✅ Party outfit generated successfully!")
        print("Check the data/output folder for your outfit images!")
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
