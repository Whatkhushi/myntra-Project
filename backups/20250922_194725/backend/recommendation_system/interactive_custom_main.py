#!/usr/bin/env python3
"""
Interactive Custom Wardrobe Fashion Recommendation System
Enhanced version with interactive seed selection and dress pairing rules
"""

import os
import sys
import json
import argparse
import logging
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Set
from pathlib import Path
from datetime import datetime
import shutil

# Add src to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from data.robust_data_manager import RobustDataManager, EmbeddingIndex
from data.custom_wardrobe_manager import CustomWardrobeManager
from recommend.robust_recommender import RobustOutfitRecommender
from add_item import ItemAdder
from dynamic_wardrobe_manager import DynamicWardrobeManager

# --- Configuration ---
LOG_DIR = os.path.join(PROJECT_ROOT, "logs")
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
RAW_DIR = os.path.join(DATA_DIR, "raw")
PROCESSED_DIR = os.path.join(DATA_DIR, "processed")
OUTPUT_DIR = os.path.join(DATA_DIR, "output")
ORGANIZED_DIR = os.path.join(OUTPUT_DIR, "organized")

# --- Logging Setup ---
def setup_logging(log_filename: str):
    os.makedirs(LOG_DIR, exist_ok=True)
    log_filepath = os.path.join(LOG_DIR, log_filename)
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_filepath),
            logging.StreamHandler(sys.stdout)
        ]
    )
    logging.info(f"Starting interactive custom wardrobe fashion recommendation system (log: {log_filepath})")

# --- Directory Management ---
def ensure_directories():
    os.makedirs(RAW_DIR, exist_ok=True)
    os.makedirs(PROCESSED_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def clean_and_reset():
    print("🧹 Performing clean reset...")
    logging.info("Performing clean reset...")

    # Clean processed data
    processed_dir = os.path.join(PROJECT_ROOT, "data", "processed")
    if os.path.exists(processed_dir):
        for item in os.listdir(processed_dir):
            item_path = os.path.join(processed_dir, item)
            if os.path.isdir(item_path):
                shutil.rmtree(item_path)
            else:
                os.remove(item_path)
    print(f"   Cleaned processed data: {processed_dir}")

    # Clean output data (preserve organized folder)
    output_dir = os.path.join(PROJECT_ROOT, "data", "output")
    if os.path.exists(output_dir):
        for item in os.listdir(output_dir):
            if item != 'organized':  # Keep organized folder
                item_path = os.path.join(output_dir, item)
                if os.path.isdir(item_path):
                    shutil.rmtree(item_path)
                else:
                    os.remove(item_path)
    print(f"   Cleaned output data: {output_dir}")

    # Clean old logs
    logs_dir = os.path.join(PROJECT_ROOT, "logs")
    if os.path.exists(logs_dir):
        for item in os.listdir(logs_dir):
            if item.endswith('.log'):
                os.remove(os.path.join(logs_dir, item))
    print(f"   Cleaned old logs: {logs_dir}")
    
    print("✅ Clean reset complete")
    logging.info("Clean reset complete")

# --- Interactive Functions ---
def display_wardrobe_items(wardrobe_df: pd.DataFrame):
    """Display available wardrobe items in a user-friendly format"""
    print("\n👗 Your Custom Wardrobe Items:")
    print("=" * 80)
    print(f"{'ID':<12} {'Category':<12} {'Subcategory':<15} {'Style Tags':<25} {'Filename'}")
    print("-" * 80)
    
    for idx, row in wardrobe_df.iterrows():
        item_id = row['id']
        category = row['category']
        subcategory = row['subcategory']
        filename = row['filename'].split('/')[-1]
        
        # Parse style tags
        style_tags_str = row.get('style_tags', '[]')
        try:
            style_tags = json.loads(style_tags_str) if isinstance(style_tags_str, str) else style_tags_str
            style_tags_display = ', '.join(style_tags[:3]) if style_tags else 'casual'
        except:
            style_tags_display = 'casual'
        
        print(f"{item_id:<12} {category:<12} {subcategory:<15} {style_tags_display:<25} {filename}")

def get_user_seed_selection(wardrobe_df: pd.DataFrame) -> List[str]:
    """Interactive seed selection with validation"""
    print("\n🎯 Select Seed Items for Outfit Generation:")
    print("=" * 50)
    
    # Display available items
    display_wardrobe_items(wardrobe_df)
    
    print("\n📝 Instructions:")
    print("• Enter item IDs separated by commas (e.g., custom_000,custom_001)")
    print("• You can select multiple items")
    print("• Only one dress can be selected at a time")
    print("• Type 'help' for more options")
    
    while True:
        user_input = input("\n🔍 Enter seed item IDs: ").strip()
        
        if user_input.lower() == 'help':
            print("\n💡 Help:")
            print("• Enter item IDs like: custom_000,custom_001,custom_002")
            print("• Type 'list' to see items again")
            print("• Type 'quit' to exit")
            continue
        
        if user_input.lower() == 'list':
            display_wardrobe_items(wardrobe_df)
            continue
        
        if user_input.lower() == 'quit':
            print("👋 Goodbye!")
            sys.exit(0)
        
        if not user_input:
            print("❌ Please enter at least one item ID")
            continue
        
        # Parse input
        try:
            selected_ids = [id.strip() for id in user_input.split(',')]
            
            # Validate IDs exist
            valid_ids = wardrobe_df['id'].tolist()
            invalid_ids = [id for id in selected_ids if id not in valid_ids]
            
            if invalid_ids:
                print(f"❌ Invalid item IDs: {', '.join(invalid_ids)}")
                print(f"Available IDs: {', '.join(valid_ids)}")
                continue
            
            # Check dress pairing rule
            selected_items = wardrobe_df[wardrobe_df['id'].isin(selected_ids)]
            dress_count = len(selected_items[selected_items['category'] == 'dress'])
            
            if dress_count > 1:
                print("❌ Cannot pair dress with dress. Please select only one dress or other types of seed items.")
                print("💡 Tip: Select one dress + other items, or select only non-dress items")
                continue
            
            # Check if dress is paired with bottom (not allowed)
            if dress_count == 1:
                bottom_count = len(selected_items[selected_items['category'] == 'bottom'])
                if bottom_count > 0:
                    print("❌ Cannot pair dress with bottom items (jeans, skirts, etc.).")
                    print("💡 Tip: Dress is complete on its own - pair with shoes, accessories, and bags only")
                    continue
            
            print(f"✅ Selected {len(selected_ids)} seed item(s): {', '.join(selected_ids)}")
            
            # Show selected items details
            print("\n📋 Selected Items:")
            for idx, row in selected_items.iterrows():
                style_tags_str = row.get('style_tags', '[]')
                try:
                    style_tags = json.loads(style_tags_str) if isinstance(style_tags_str, str) else style_tags_str
                    style_tags_display = ', '.join(style_tags[:3]) if style_tags else 'casual'
                except:
                    style_tags_display = 'casual'
                
                print(f"  • {row['id']}: {row['category']} - {row['subcategory']} ({style_tags_display})")
            
            return selected_ids
            
        except Exception as e:
            print(f"❌ Error parsing input: {e}")
            continue

def get_occasion_selection() -> str:
    """Get occasion selection from user"""
    print("\n🎭 Select Occasion:")
    print("=" * 30)
    print("1. casual")
    print("2. formal") 
    print("3. party")
    print("4. semi-formal")
    
    while True:
        choice = input("\n🔍 Enter occasion (1-4) or type the name: ").strip().lower()
        
        occasion_map = {
            '1': 'casual',
            '2': 'formal',
            '3': 'party', 
            '4': 'semi-formal',
            'casual': 'casual',
            'formal': 'formal',
            'party': 'party',
            'semi-formal': 'semi-formal',
            'semi formal': 'semi-formal'
        }
        
        if choice in occasion_map:
            selected_occasion = occasion_map[choice]
            print(f"✅ Selected occasion: {selected_occasion}")
            return selected_occasion
        else:
            print("❌ Invalid choice. Please select 1-4 or type the occasion name.")

def get_num_outfits() -> int:
    """Get number of outfits to generate"""
    print("\n🔢 Number of Outfits:")
    print("=" * 25)
    
    while True:
        try:
            num = input("🔍 How many outfits to generate (1-5): ").strip()
            num_outfits = int(num)
            
            if 1 <= num_outfits <= 5:
                print(f"✅ Will generate {num_outfits} outfit(s)")
                return num_outfits
            else:
                print("❌ Please enter a number between 1 and 5")
        except ValueError:
            print("❌ Please enter a valid number")

# --- Pipeline Steps ---
def run_custom_classification_step(custom_manager: CustomWardrobeManager) -> pd.DataFrame:
    print("📊 Generating style.csv with custom wardrobe...")
    logging.info("Extracting custom wardrobe classifications...")
    style_df = custom_manager.extract_custom_wardrobe_classifications()
    if style_df.empty:
        print("❌ No custom wardrobe items found!")
        logging.error("No custom wardrobe items found!")
        sys.exit(1)
    custom_manager.create_style_csv(style_df)
    return style_df

def run_create_datasets_step(custom_manager: CustomWardrobeManager, style_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
    return custom_manager.create_custom_datasets(style_df)

def run_generate_embeddings_step(data_manager: RobustDataManager, wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame) -> EmbeddingIndex:
    print("🧠 Generating embeddings...")
    logging.info("Generating embeddings...")
    embedding_index = data_manager.generate_embeddings(wardrobe_df, catalog_df)
    logging.info("Embeddings generated successfully")
    return embedding_index

def run_interactive_recommendations(wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame, 
                                  embedding_index: EmbeddingIndex, seed_item_ids: List[str],
                                  occasion: str, num_outfits: int):
    """Generate outfit recommendations with enhanced display"""
    print("\n✨ Generating outfit recommendations...")
    logging.info("Generating outfit recommendations...")
    
    recommender = RobustOutfitRecommender(
        wardrobe_df=wardrobe_df,
        catalog_df=catalog_df,
        embedding_index=embedding_index,
        image_base_dir=os.path.join(PROJECT_ROOT, "data", "output", "organized"),
        output_dir=os.path.join(PROJECT_ROOT, "data", "output")
    )
    
    recommendations = recommender.recommend_outfits(
        seed_item_ids=seed_item_ids,
        occasion=occasion,
        num_outfits=num_outfits
    )
    
    if recommendations:
        print(f"\n✅ Generated {len(recommendations)} outfit recommendation(s)")
        logging.info(f"Generated {len(recommendations)} outfit recommendations")
        
        # Enhanced display of recommendations
        display_recommendations(recommendations, seed_item_ids)
        
    else:
        print("❌ No outfit recommendations could be generated.")
        logging.warning("No outfit recommendations could be generated.")
    
    return recommendations

def display_recommendations(recommendations: List[Dict], seed_item_ids: List[str]):
    """Enhanced display of outfit recommendations"""
    print("\n" + "="*80)
    print("👗 RECOMMENDED OUTFITS")
    print("="*80)
    
    for i, outfit in enumerate(recommendations, 1):
        print(f"\n🎯 OUTFIT {i} (Score: {outfit['score']:.2f})")
        print("-" * 50)
        print(f"📝 Description: {outfit['description']}")
        print(f"🎭 Occasion: {outfit['occasion']}")
        print(f"🖼️  Image: {outfit['image_path']}")
        
        print(f"\n📋 Items in this outfit:")
        print("-" * 30)
        
        # Categorize items
        items_by_category = {}
        for item in outfit['items']:
            category = item.get('category', 'unknown')
            if category not in items_by_category:
                items_by_category[category] = []
            items_by_category[category].append(item)
        
        # Display items by category
        for category, items in items_by_category.items():
            print(f"\n  {category.upper()}:")
            for item in items:
                item_id = item.get('id', 'unknown')
                subcategory = item.get('subcategory', 'unknown')
                color = item.get('dominant_color_name', 'unknown')
                
                # Parse style tags
                style_tags_str = item.get('style_tags', '[]')
                try:
                    style_tags = json.loads(style_tags_str) if isinstance(style_tags_str, str) else style_tags_str
                    style_tags_display = ', '.join(style_tags[:3]) if style_tags else 'casual'
                except:
                    style_tags_display = 'casual'
                
                # Highlight seed items
                is_seed = item_id in seed_item_ids
                marker = "⭐ " if is_seed else "  "
                
                print(f"    {marker}{subcategory} ({color}, {style_tags_display})")
                if is_seed:
                    print(f"      └─ SEED ITEM")
        
        # Show overall vibe
        print(f"\n🎨 Overall Vibe: {get_outfit_vibe(outfit['items'])}")

def get_outfit_vibe(items: List[Dict]) -> str:
    """Determine overall vibe of the outfit"""
    all_style_tags = []
    
    for item in items:
        style_tags_str = item.get('style_tags', '[]')
        try:
            style_tags = json.loads(style_tags_str) if isinstance(style_tags_str, str) else style_tags_str
            if isinstance(style_tags, list):
                all_style_tags.extend(style_tags)
        except:
            pass
    
    # Count style tags
    from collections import Counter
    tag_counts = Counter(all_style_tags)
    
    # Return most common vibe
    if tag_counts:
        return tag_counts.most_common(1)[0][0]
    return "casual"

def ask_to_add_items() -> bool:
    """Ask user if they want to add new items to the wardrobe"""
    print("\n" + "="*60)
    print("➕ WARDROBE MANAGEMENT")
    print("="*60)
    print("Do you want to add new items to your wardrobe before generating recommendations?")
    print("You can add images and they will be automatically classified and added to your wardrobe.")
    
    while True:
        choice = input("\n🔍 Add new items? (yes/no): ").strip().lower()
        if choice in ['y', 'yes']:
            return True
        elif choice in ['n', 'no']:
            return False
        else:
            print("❌ Please enter 'yes' or 'no'")

def add_new_items(dynamic_manager: DynamicWardrobeManager) -> int:
    """Add new items to the wardrobe dynamically"""
    print("\n" + "="*60)
    print("➕ ADD NEW ITEMS TO WARDROBE")
    print("="*60)
    
    # Initialize item adder
    item_adder = ItemAdder(
        organized_dir=ORGANIZED_DIR,
        processed_dir=PROCESSED_DIR,
        output_dir=OUTPUT_DIR
    )
    
    # Ask how many items to add
    print("\nHow many items would you like to add?")
    print("1. Add a single item")
    print("2. Add multiple items")
    print("3. Skip adding items")
    
    while True:
        choice = input("\n🔍 Enter your choice (1-3): ").strip()
        
        if choice == '1':
            if item_adder.add_single_item_dynamically(dynamic_manager):
                return 1
            else:
                return 0
        elif choice == '2':
            return item_adder.add_multiple_items_dynamically(dynamic_manager)
        elif choice == '3':
            print("⏭️  Skipping item addition")
            return 0
        else:
            print("❌ Invalid choice. Please select 1-3.")

def run_interactive_pipeline():
    """Run the complete interactive pipeline"""
    print("🚀 Starting Interactive Custom Wardrobe System")
    print("=" * 60)
    logging.info("Running interactive custom wardrobe pipeline...")

    # Step 1: Clean and reset
    clean_and_reset()
    ensure_directories()

    # Step 2: Initialize dynamic wardrobe manager
    dynamic_manager = DynamicWardrobeManager(
        processed_dir=PROCESSED_DIR,
        output_dir=OUTPUT_DIR
    )

    # Step 3: Load existing data or create new
    if not dynamic_manager.load_existing_data():
        print("📊 No existing data found. Creating new wardrobe...")
        # Create initial wardrobe using custom manager
        custom_manager = CustomWardrobeManager(
            organized_dir=ORGANIZED_DIR,
            processed_dir=PROCESSED_DIR
        )
        style_df = run_custom_classification_step(custom_manager)
        wardrobe_df, catalog_df = run_create_datasets_step(custom_manager, style_df)
        
        # Generate embeddings
        data_manager = RobustDataManager(
            raw_dir=RAW_DIR,
            processed_dir=PROCESSED_DIR,
            output_dir=OUTPUT_DIR
        )
        embedding_index = run_generate_embeddings_step(data_manager, wardrobe_df, catalog_df)
        
        # Load the newly created data into dynamic manager
        dynamic_manager.load_existing_data()

    # Step 4: Ask if user wants to add new items
    if ask_to_add_items():
        added_count = add_new_items(dynamic_manager)
        if added_count > 0:
            print(f"\n✅ Successfully added {added_count} new item(s) to your wardrobe!")
            print("🔄 These items are now available as seed items in recommendations.")

    # Step 5: Get current data from dynamic manager
    wardrobe_df = dynamic_manager.get_wardrobe_items()
    catalog_df = dynamic_manager.get_catalog_items()
    embedding_index = dynamic_manager.get_embedding_index()

    # Step 6: Interactive recommendation generation
    while True:
        print("\n" + "="*60)
        print("🎨 INTERACTIVE OUTFIT GENERATOR")
        print("="*60)
        
        # Get user selections
        seed_item_ids = get_user_seed_selection(wardrobe_df)
        occasion = get_occasion_selection()
        num_outfits = get_num_outfits()
        
        # Generate recommendations
        recommendations = run_interactive_recommendations(
            wardrobe_df, catalog_df, embedding_index, 
            seed_item_ids, occasion, num_outfits
        )
        
        # Ask if user wants to generate more outfits
        print("\n" + "="*60)
        while True:
            continue_choice = input("🔄 Generate more outfits? (y/n): ").strip().lower()
            if continue_choice in ['y', 'yes', 'n', 'no']:
                break
            print("❌ Please enter 'y' or 'n'")
        
        if continue_choice in ['n', 'no']:
            print("\n👋 Thank you for using the Interactive Custom Wardrobe System!")
            break

def main():
    parser = argparse.ArgumentParser(description="Interactive Custom Wardrobe Fashion Recommendation System")
    parser.add_argument("--clean", action="store_true", help="Clean all auto-generated files and folders.")
    parser.add_argument("--interactive", action="store_true", help="Run interactive mode (default).")
    
    args = parser.parse_args()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    setup_logging(f"interactive_run_{timestamp}.log")

    if args.clean:
        clean_and_reset()
    else:
        # Default to interactive mode
        run_interactive_pipeline()

if __name__ == "__main__":
    main()
