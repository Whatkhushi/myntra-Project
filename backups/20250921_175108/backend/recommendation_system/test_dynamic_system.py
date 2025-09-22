#!/usr/bin/env python3
"""
Test script for the dynamic wardrobe system
Demonstrates how new items are added dynamically and immediately available
"""

import os
import sys
import pandas as pd
import numpy as np
from PIL import Image

# Add src to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from dynamic_wardrobe_manager import DynamicWardrobeManager
from add_item import ItemAdder

def test_dynamic_system():
    """Test the dynamic wardrobe system"""
    print("🧪 Testing Dynamic Wardrobe System")
    print("=" * 50)
    
    # Initialize dynamic manager
    processed_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    output_dir = os.path.join(PROJECT_ROOT, "data", "output")
    
    dynamic_manager = DynamicWardrobeManager(processed_dir, output_dir)
    
    # Test 1: Load existing data
    print("\n📊 Test 1: Loading existing data...")
    if dynamic_manager.load_existing_data():
        print("✅ Successfully loaded existing data")
        wardrobe_df = dynamic_manager.get_wardrobe_items()
        print(f"   Wardrobe items: {len(wardrobe_df)}")
        print(f"   Wardrobe IDs: {list(wardrobe_df['id'].values)[:5]}...")
    else:
        print("❌ Failed to load existing data")
        return False
    
    # Test 2: Check embedding index
    print("\n🧠 Test 2: Checking embedding index...")
    embedding_index = dynamic_manager.get_embedding_index()
    if embedding_index._wardrobe_emb is not None:
        print(f"✅ Wardrobe embeddings: {len(embedding_index._wardrobe_ids)} items")
        print(f"   Embedding shape: {embedding_index._wardrobe_emb.shape}")
    else:
        print("❌ No wardrobe embeddings found")
        return False
    
    # Test 3: Simulate adding a new item (without actual file selection)
    print("\n➕ Test 3: Simulating dynamic item addition...")
    
    # Create a dummy image for testing
    dummy_image_path = os.path.join(PROJECT_ROOT, "data", "output", "test_item.png")
    dummy_image = Image.new('RGB', (100, 100), color='red')
    dummy_image.save(dummy_image_path)
    
    try:
        # Add the item dynamically
        metadata = dynamic_manager.add_new_item_dynamically(dummy_image_path, 'tops')
        if metadata:
            print("✅ Successfully added new item dynamically")
            print(f"   Item ID: {metadata['id']}")
            print(f"   Category: {metadata['category']}")
            print(f"   Subcategory: {metadata['subcategory']}")
            
            # Test 4: Verify item is immediately available
            print("\n🔍 Test 4: Verifying immediate availability...")
            updated_wardrobe = dynamic_manager.get_wardrobe_items()
            print(f"   Updated wardrobe size: {len(updated_wardrobe)}")
            
            if metadata['id'] in updated_wardrobe['id'].values:
                print("✅ New item is immediately available in wardrobe")
            else:
                print("❌ New item not found in wardrobe")
                return False
            
            # Test 5: Check embedding was added
            print("\n🧠 Test 5: Checking embedding was added...")
            updated_embedding_index = dynamic_manager.get_embedding_index()
            if metadata['id'] in updated_embedding_index._wardrobe_ids:
                print("✅ New item embedding is immediately available")
                print(f"   Updated wardrobe embeddings: {len(updated_embedding_index._wardrobe_ids)} items")
            else:
                print("❌ New item embedding not found")
                return False
            
            # Test 6: Verify persistence
            print("\n💾 Test 6: Verifying persistence...")
            style_df = dynamic_manager.get_style_data()
            if metadata['id'] in style_df['id'].values:
                print("✅ New item persisted in style.csv")
            else:
                print("❌ New item not persisted in style.csv")
                return False
            
            print("\n🎉 All tests passed! Dynamic wardrobe system is working correctly.")
            return True
            
        else:
            print("❌ Failed to add new item dynamically")
            return False
            
    except Exception as e:
        print(f"❌ Error during testing: {e}")
        return False
    
    finally:
        # Clean up test file
        if os.path.exists(dummy_image_path):
            os.remove(dummy_image_path)

if __name__ == "__main__":
    success = test_dynamic_system()
    if success:
        print("\n✅ Dynamic wardrobe system test completed successfully!")
    else:
        print("\n❌ Dynamic wardrobe system test failed!")
        sys.exit(1)
