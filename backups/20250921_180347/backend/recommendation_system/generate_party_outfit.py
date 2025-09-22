#!/usr/bin/env python3
"""
Generate Party Outfit Script
Uses custom_010 (Camisole) as seed item to generate party outfits
"""

import os
import sys
import subprocess
from datetime import datetime

def generate_party_outfit():
    """Generate party outfit using camisole as seed item"""
    print("🎉 Generating Party Outfit with Camisole (custom_010)")
    print("=" * 60)
    
    # Change to the recommendation system directory
    os.chdir('/Users/mishtyverma/closet-twin-style-3/backend/recommendation_system')
    
    # Command to generate party outfit
    cmd = [
        'python', 'custom_main.py', 
        '--all',
        '--seed', 'custom_010',  # Camisole
        '--occasion', 'party',
        '--num-outfits', '3'
    ]
    
    print(f"Running command: {' '.join(cmd)}")
    print("-" * 60)
    
    try:
        # Run the command
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        
        print("✅ Party outfit generation completed successfully!")
        print("\n" + "=" * 60)
        print("OUTPUT:")
        print("=" * 60)
        print(result.stdout)
        
        if result.stderr:
            print("\nWARNINGS/INFO:")
            print("-" * 40)
            print(result.stderr)
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Error generating party outfit: {e}")
        print("\nSTDOUT:")
        print(e.stdout)
        print("\nSTDERR:")
        print(e.stderr)
        return False
    
    return True

def show_wardrobe_items():
    """Show available wardrobe items for reference"""
    print("\n📋 Your Custom Wardrobe Items:")
    print("-" * 40)
    wardrobe_items = {
        'custom_000': 'Skirt',
        'custom_001': 'Tote bag', 
        'custom_002': 'Jeans (pair 1)',
        'custom_003': 'Bracelet',
        'custom_004': 'Jeans (pair 2)',
        'custom_005': 'Cocktail dress (1)',
        'custom_006': 'Cocktail dress (2)',
        'custom_007': 'Belt',
        'custom_008': 'T-shirt',
        'custom_009': 'Bucket bag',
        'custom_010': 'Camisole ⭐ (SEED ITEM)',
        'custom_011': 'Cocktail dress (3)',
        'custom_012': 'Cocktail dress (4)'
    }
    
    for item_id, description in wardrobe_items.items():
        if item_id == 'custom_010':
            print(f"  {item_id}: {description}")
        else:
            print(f"  {item_id}: {description}")

def main():
    print("👗 Party Outfit Generator")
    print("Using Camisole (custom_010) as seed item")
    print(f"Generated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Show wardrobe items
    show_wardrobe_items()
    print()
    
    # Generate party outfit
    success = generate_party_outfit()
    
    if success:
        print("\n🎉 Party outfit generation completed!")
        print("Check the output folder for generated outfit images.")
    else:
        print("\n❌ Failed to generate party outfit.")
        sys.exit(1)

if __name__ == "__main__":
    main()
