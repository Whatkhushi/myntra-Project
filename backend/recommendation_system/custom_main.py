import os
import sys
import json
import argparse
import logging
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple
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
    logging.info(f"Starting custom wardrobe fashion recommendation system (log: {log_filepath})")

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

def run_recommendations(wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame, 
                        embedding_index: EmbeddingIndex, seed_item_ids: List[str],
                        occasion: str, num_outfits: int):
    """Generate outfit recommendations"""
    print("✨ Generating outfit recommendations...")
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
        print(f"✅ Generated {len(recommendations)} outfit recommendations")
        logging.info(f"Generated {len(recommendations)} outfit recommendations")
        
        # Print summary
        for i, outfit in enumerate(recommendations):
            print(f"\n👗 Outfit {i+1} (Score: {outfit['score']:.2f})")
            print(f"   📝 {outfit['description']}")
            print(f"   🖼️  Image: {outfit['image_path']}")
            print(f"   🎯 Occasion: {outfit['occasion']}")
            print(f"   📋 Items:")
            for item in outfit['items']:
                # Ensure style_tags are displayed correctly
                style_tags_str = item.get('style_tags', '[]')
                if isinstance(style_tags_str, str):
                    try:
                        style_tags_list = json.loads(style_tags_str)
                    except json.JSONDecodeError:
                        style_tags_list = [style_tags_str]
                else:
                    style_tags_list = style_tags_str
                
                print(f"      • {item.get('category', 'Unknown')} - {item.get('subcategory', 'Unknown')} ({item.get('dominant_color_name', 'Unknown')}, {', '.join(style_tags_list)})")
        print("\n🎉 Successfully generated outfit recommendations!")
    else:
        print("❌ No outfit recommendations could be generated.")
        logging.warning("No outfit recommendations could be generated.")
    return recommendations

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

def run_complete_pipeline(seed_item_ids: List[str], occasion: str, num_outfits: int):
    print("🚀 Running complete custom wardrobe pipeline...")
    logging.info("Running complete custom wardrobe pipeline...")

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

    # Step 6: Generate outfit recommendations
    run_recommendations(wardrobe_df, catalog_df, embedding_index, seed_item_ids, occasion, num_outfits)
    
    logging.info("✅ Custom wardrobe fashion recommendation system completed")

def main():
    parser = argparse.ArgumentParser(description="Custom Wardrobe Fashion Recommendation System")
    parser.add_argument("--clean", action="store_true", help="Clean all auto-generated files and folders.")
    parser.add_argument("--all", action="store_true", help="Run the complete pipeline from custom wardrobe to recommendations.")
    parser.add_argument("--seed", type=str, default="custom_000,custom_001", 
                        help="Comma-separated list of seed item IDs (e.g., 'custom_000,custom_001').")
    parser.add_argument("--occasion", type=str, default="casual", 
                        help="Occasion for recommendations (e.g., 'casual', 'formal', 'party').")
    parser.add_argument("--num-outfits", type=int, default=3, 
                        help="Number of outfits to generate.")
    
    args = parser.parse_args()

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    setup_logging(f"custom_run_{timestamp}.log")

    if args.clean:
        clean_and_reset()
    elif args.all:
        seed_item_ids = [s.strip() for s in args.seed.split(',')]
        run_complete_pipeline(seed_item_ids, args.occasion, args.num_outfits)
    else:
        print("Please specify an action: --clean or --all")
        parser.print_help()

if __name__ == "__main__":
    main()
