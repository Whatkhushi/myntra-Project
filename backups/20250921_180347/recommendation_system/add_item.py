#!/usr/bin/env python3
"""
Add Item to Wardrobe System
Allows users to add new items to the wardrobe with automatic classification and embedding generation
"""

import os
import sys
import json
import shutil
import pandas as pd
import numpy as np
from PIL import Image
from typing import List, Dict, Tuple, Optional
from datetime import datetime
import tkinter as tk
from tkinter import filedialog, messagebox
import uuid

# Add src to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from data.robust_data_manager import RobustDataManager, EmbeddingIndex
from classify.robust_classifier import RobustClassifier
from dynamic_wardrobe_manager import DynamicWardrobeManager

class ItemAdder:
    def __init__(self, organized_dir: str, processed_dir: str, output_dir: str):
        self.organized_dir = organized_dir
        self.processed_dir = processed_dir
        self.output_dir = output_dir
        self.classifier = RobustClassifier()
        self.data_manager = RobustDataManager(
            raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
            processed_dir=processed_dir,
            output_dir=output_dir
        )
        
        # Ensure directories exist
        os.makedirs(organized_dir, exist_ok=True)
        os.makedirs(processed_dir, exist_ok=True)
        os.makedirs(output_dir, exist_ok=True)

    def select_image_file(self) -> Optional[str]:
        """Open file dialog to select an image file"""
        print("📁 Opening file selection dialog...")
        
        # Create a hidden root window for the file dialog
        root = tk.Tk()
        root.withdraw()  # Hide the main window
        
        # Configure file dialog
        filetypes = [
            ("Image files", "*.jpg *.jpeg *.png *.webp *.bmp *.tiff"),
            ("JPEG files", "*.jpg *.jpeg"),
            ("PNG files", "*.png"),
            ("WebP files", "*.webp"),
            ("All files", "*.*")
        ]
        
        file_path = filedialog.askopenfilename(
            title="Select an image to add to your wardrobe",
            filetypes=filetypes
        )
        
        root.destroy()  # Clean up the tkinter window
        
        if file_path:
            print(f"✅ Selected image: {os.path.basename(file_path)}")
            return file_path
        else:
            print("❌ No file selected")
            return None

    def select_main_category(self) -> Optional[str]:
        """Interactive category selection"""
        print("\n📋 Select the main category for this item:")
        print("=" * 50)
        
        categories = {
            '1': 'tops',
            '2': 'bottoms', 
            '3': 'shoes',
            '4': 'accessories',
            '5': 'dresses'
        }
        
        print("1. Tops (shirts, blouses, camisoles, etc.)")
        print("2. Bottoms (jeans, skirts, pants, etc.)")
        print("3. Shoes (heels, sneakers, boots, etc.)")
        print("4. Accessories (bags, jewelry, belts, etc.)")
        print("5. Dresses (cocktail, maxi, mini, etc.)")
        
        while True:
            choice = input("\n🔍 Enter your choice (1-5): ").strip()
            
            if choice in categories:
                selected_category = categories[choice]
                print(f"✅ Selected category: {selected_category}")
                return selected_category
            else:
                print("❌ Invalid choice. Please select 1-5.")

    def copy_image_to_organized(self, image_path: str, category: str) -> str:
        """Copy image to organized folder structure"""
        # Create category directory if it doesn't exist
        category_dir = os.path.join(self.organized_dir, category.title())
        os.makedirs(category_dir, exist_ok=True)
        
        # Generate unique filename to avoid conflicts
        original_name = os.path.basename(image_path)
        name, ext = os.path.splitext(original_name)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        unique_filename = f"{name}_{timestamp}{ext}"
        
        # Copy to organized folder
        dest_path = os.path.join(category_dir, unique_filename)
        shutil.copy2(image_path, dest_path)
        
        print(f"📁 Copied image to: {dest_path}")
        return dest_path

    def classify_new_item(self, image_path: str, user_category: str) -> Dict:
        """Classify the new item using existing classification pipeline"""
        print(f"🔍 Classifying new item: {os.path.basename(image_path)}")
        
        try:
            # Use existing classifier to get all metadata
            classification_result = self.classifier.classify_image(image_path)
            
            # Override the category with user selection
            classification_result['category'] = user_category
            
            # Get image properties
            with Image.open(image_path) as img:
                width, height = img.size
            
            # Generate unique item ID
            item_id = f"new_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(uuid.uuid4())[:8]}"
            
            # Create metadata entry matching existing style.csv format
            metadata = {
                'id': item_id,
                'filename': image_path,
                'source': 'user_added',
                'category': user_category,
                'category_conf': classification_result.get('category_conf', 1.0),
                'subcategory': classification_result.get('subcategory', 'unknown'),
                'subcategory_conf': classification_result.get('subcategory_conf', 1.0),
                'neckline': classification_result.get('neckline', 'unknown'),
                'neckline_conf': classification_result.get('neckline_conf', 1.0),
                'sleeve_length': classification_result.get('sleeve_length', 'unknown'),
                'sleeve_length_conf': classification_result.get('sleeve_length_conf', 1.0),
                'length_type': classification_result.get('length_type', 'unknown'),
                'length_conf': classification_result.get('length_conf', 1.0),
                'fit': classification_result.get('fit', 'unknown'),
                'fit_conf': classification_result.get('fit_conf', 1.0),
                'silhouette': classification_result.get('silhouette', 'unknown'),
                'silhouette_conf': classification_result.get('silhouette_conf', 1.0),
                'fabric_type': classification_result.get('fabric_type', 'unknown'),
                'fabric_conf': classification_result.get('fabric_conf', 1.0),
                'pattern': classification_result.get('pattern', 'solid'),
                'pattern_confidence': classification_result.get('pattern_confidence', 1.0),
                'pattern_scale': classification_result.get('pattern_scale', 'medium'),
                'style_tags': json.dumps(classification_result.get('style_tags', ['casual'])),
                'style_confidence': json.dumps(classification_result.get('style_confidence', [1.0])),
                'formality': classification_result.get('formality', 'casual'),
                'formality_conf': classification_result.get('formality_conf', 1.0),
                'season': classification_result.get('season', 'all_season'),
                'season_conf': classification_result.get('season_conf', 1.0),
                'tradition': classification_result.get('tradition', 'western'),
                'tradition_conf': classification_result.get('tradition_conf', 1.0),
                'gender_target': classification_result.get('gender_target', 'women'),
                'gender_conf': classification_result.get('gender_conf', 1.0),
                'dominant_color_hex': classification_result.get('dominant_color_hex', '#ffffff'),
                'dominant_color_name': classification_result.get('dominant_color_name', 'white'),
                'dominant_color_h': classification_result.get('dominant_color_h', 0),
                'dominant_color_s': classification_result.get('dominant_color_s', 0),
                'dominant_color_v': classification_result.get('dominant_color_v', 100),
                'secondary_colors': classification_result.get('secondary_colors', '[]'),
                'colorfulness_score': classification_result.get('colorfulness_score', 0.0),
                'brightness_score': classification_result.get('brightness_score', 1.0),
                'emb_index': -1,  # Will be updated when embeddings are generated
                'width_px': width,
                'height_px': height,
                'bbox_garment': classification_result.get('bbox_garment', ''),
                'created_at': datetime.now().isoformat()
            }
            
            print(f"✅ Classification completed for {item_id}")
            print(f"   Category: {user_category}")
            print(f"   Subcategory: {metadata['subcategory']}")
            print(f"   Style tags: {json.loads(metadata['style_tags'])}")
            
            return metadata
            
        except Exception as e:
            print(f"❌ Error classifying item: {e}")
            return None

    def add_item_to_wardrobe(self, metadata: Dict) -> bool:
        """Add the new item to the wardrobe dataset"""
        try:
            # Load existing style.csv
            style_csv_path = os.path.join(self.processed_dir, 'style.csv')
            
            if os.path.exists(style_csv_path):
                existing_df = pd.read_csv(style_csv_path)
                print(f"📊 Loaded existing wardrobe with {len(existing_df)} items")
            else:
                # Create new DataFrame if style.csv doesn't exist
                existing_df = pd.DataFrame()
                print("📊 Creating new wardrobe dataset")
            
            # Add new item
            new_row = pd.DataFrame([metadata])
            updated_df = pd.concat([existing_df, new_row], ignore_index=True)
            
            # Save updated dataset
            updated_df.to_csv(style_csv_path, index=False)
            print(f"✅ Added new item to wardrobe. Total items: {len(updated_df)}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error adding item to wardrobe: {e}")
            return False

    def add_single_item(self) -> bool:
        """Add a single item to the wardrobe"""
        print("\n" + "="*60)
        print("➕ ADD NEW ITEM TO WARDROBE")
        print("="*60)
        
        # Step 1: Select image
        image_path = self.select_image_file()
        if not image_path:
            return False
        
        # Step 2: Select category
        category = self.select_main_category()
        if not category:
            return False
        
        # Step 3: Copy image to organized folder
        organized_path = self.copy_image_to_organized(image_path, category)
        
        # Step 4: Classify item
        metadata = self.classify_new_item(organized_path, category)
        if not metadata:
            return False
        
        # Step 5: Add to wardrobe
        success = self.add_item_to_wardrobe(metadata)
        if success:
            print(f"\n🎉 Successfully added new item!")
            print(f"   Item ID: {metadata['id']}")
            print(f"   Category: {metadata['category']}")
            print(f"   Subcategory: {metadata['subcategory']}")
            print(f"   Style: {', '.join(json.loads(metadata['style_tags']))}")
            return True
        else:
            return False

    def add_single_item_dynamically(self, dynamic_manager: DynamicWardrobeManager) -> bool:
        """Add a single item to the wardrobe dynamically (in-memory update)"""
        print("\n" + "="*60)
        print("➕ ADD NEW ITEM TO WARDROBE (DYNAMIC)")
        print("="*60)
        
        # Step 1: Select image
        image_path = self.select_image_file()
        if not image_path:
            return False
        
        # Step 2: Select category
        category = self.select_main_category()
        if not category:
            return False
        
        # Step 3: Copy image to organized folder
        organized_path = self.copy_image_to_organized(image_path, category)
        
        # Step 4: Add item dynamically
        metadata = dynamic_manager.add_new_item_dynamically(organized_path, category)
        if not metadata:
            return False
        
        print(f"\n🎉 Successfully added new item dynamically!")
        print(f"   Item ID: {metadata['id']}")
        print(f"   Category: {metadata['category']}")
        print(f"   Subcategory: {metadata['subcategory']}")
        print(f"   Style: {', '.join(json.loads(metadata['style_tags']))}")
        print(f"   ✅ Item is now available in wardrobe and seed selection!")
        
        return True

    def add_multiple_items(self) -> int:
        """Add multiple items to the wardrobe"""
        print("\n" + "="*60)
        print("➕ ADD MULTIPLE ITEMS TO WARDROBE")
        print("="*60)
        
        added_count = 0
        
        while True:
            print(f"\n📊 Items added so far: {added_count}")
            
            # Ask if user wants to add another item
            choice = input("🔍 Add another item? (yes/no): ").strip().lower()
            
            if choice in ['n', 'no']:
                break
            elif choice in ['y', 'yes']:
                if self.add_single_item():
                    added_count += 1
                else:
                    print("❌ Failed to add item. Continuing...")
            else:
                print("❌ Please enter 'yes' or 'no'")
        
        print(f"\n✅ Added {added_count} new items to your wardrobe!")
        return added_count

    def add_multiple_items_dynamically(self, dynamic_manager: DynamicWardrobeManager) -> int:
        """Add multiple items to the wardrobe dynamically (in-memory update)"""
        print("\n" + "="*60)
        print("➕ ADD MULTIPLE ITEMS TO WARDROBE (DYNAMIC)")
        print("="*60)
        
        added_count = 0
        
        while True:
            print(f"\n📊 Items added so far: {added_count}")
            
            # Ask if user wants to add another item
            choice = input("🔍 Add another item? (yes/no): ").strip().lower()
            
            if choice in ['n', 'no']:
                break
            elif choice in ['y', 'yes']:
                if self.add_single_item_dynamically(dynamic_manager):
                    added_count += 1
                else:
                    print("❌ Failed to add item. Continuing...")
            else:
                print("❌ Please enter 'yes' or 'no'")
        
        print(f"\n✅ Added {added_count} new items to your wardrobe!")
        print(f"✅ All items are now available in wardrobe and seed selection!")
        return added_count

def main():
    """Main function for testing add_item.py independently"""
    print("🎨 Item Addition System")
    print("=" * 40)
    
    # Initialize paths
    organized_dir = os.path.join(PROJECT_ROOT, "data", "output", "organized")
    processed_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    output_dir = os.path.join(PROJECT_ROOT, "data", "output")
    
    # Create item adder
    adder = ItemAdder(organized_dir, processed_dir, output_dir)
    
    # Ask user what they want to do
    print("\nWhat would you like to do?")
    print("1. Add a single item")
    print("2. Add multiple items")
    print("3. Exit")
    
    while True:
        choice = input("\n🔍 Enter your choice (1-3): ").strip()
        
        if choice == '1':
            adder.add_single_item()
            break
        elif choice == '2':
            adder.add_multiple_items()
            break
        elif choice == '3':
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please select 1-3.")

if __name__ == "__main__":
    main()
