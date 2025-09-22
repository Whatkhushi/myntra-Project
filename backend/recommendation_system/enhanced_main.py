#!/usr/bin/env python3
"""
Enhanced Fashion Recommendation System
=====================================

This script implements a comprehensive fashion recommendation system with:
1. Robust image classification with heuristics to fix gross errors
2. Guaranteed full outfit generation with strict validity rules
3. High-resolution collage generation (1200px+ width)
4. Complete CSV schema with all required attributes
5. Support for both ethnic and western fashion
6. New item upload functionality with immediate integration
7. Precomputed text embeddings for efficiency
"""

import os
import sys
import json
import argparse
import logging
import pandas as pd
from typing import List, Dict, Tuple
from pathlib import Path
from datetime import datetime

# Add src to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from src.data.robust_data_manager import RobustDataManager, EmbeddingIndex
from src.recommend.robust_recommender import RobustOutfitRecommender


def setup_logging():
    """Setup logging for the system"""
    logs_dir = os.path.join(PROJECT_ROOT, "logs")
    os.makedirs(logs_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = os.path.join(logs_dir, f"run_{timestamp}.log")
    
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(log_file),
            logging.StreamHandler()
        ]
    )
    
    return log_file


def ensure_directories():
    """Ensure all required directories exist"""
    directories = [
        "data/raw",
        "data/processed", 
        "data/embeddings",
        "data/output",
        "data/output/recommendations",
        "data/output/organized",
        "data/uploads",
        "data/uploads/organized",
        "logs",
        "backups",
        "archived_versions"
    ]
    
    for directory in directories:
        os.makedirs(os.path.join(PROJECT_ROOT, directory), exist_ok=True)


def classify_new_images(data_manager: RobustDataManager) -> pd.DataFrame:
    """Classify all new images in the raw/images folder"""
    logging.info("🔍 Classifying new images with robust heuristics...")
    
    raw_images_dir = os.path.join(PROJECT_ROOT, "data", "raw", "images")
    
    # Get all image files
    image_paths = []
    for root, dirs, files in os.walk(raw_images_dir):
        for file in files:
            if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                image_paths.append(os.path.join(root, file))
    
    if not image_paths:
        logging.warning("❌ No images found in raw/images folder!")
        return pd.DataFrame()
    
    logging.info(f"📸 Found {len(image_paths)} images to classify")
    
    # Process images and create style dataset
    style_df = data_manager.process_image_classifications(image_paths)
    
    logging.info(f"✅ Classified {len(style_df)} images")
    return style_df


def create_enhanced_datasets(data_manager: RobustDataManager, max_wardrobe_items: int = 10) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """Create enhanced datasets with comprehensive features"""
    logging.info("📊 Creating enhanced datasets...")
    
    # Create enhanced datasets
    wardrobe_df, catalog_df = data_manager.create_enhanced_datasets(max_wardrobe_items)
    
    logging.info(f"✅ Created enhanced datasets:")
    logging.info(f"   👗 User Wardrobe: {len(wardrobe_df)} items")
    logging.info(f"   🛍️  Myntra Database: {len(catalog_df)} items")
    
    return wardrobe_df, catalog_df


def generate_embeddings(data_manager: RobustDataManager, wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame) -> EmbeddingIndex:
    """Generate CLIP embeddings for all items"""
    logging.info("🧠 Generating embeddings...")
    
    # Generate embeddings
    embedding_index = data_manager.generate_embeddings(wardrobe_df, catalog_df)
    
    logging.info("✅ Embeddings generated successfully")
    return embedding_index


def generate_guaranteed_recommendations(wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame, 
                                     embedding_index: EmbeddingIndex, seed_item_ids: List[int] = None, 
                                     occasion: str = "casual", num_outfits: int = 3) -> List[Dict]:
    """Generate guaranteed outfit recommendations"""
    logging.info("✨ Generating guaranteed outfit recommendations...")
    
    # Create robust recommender
    recommender = RobustOutfitRecommender(
        wardrobe_df=wardrobe_df,
        catalog_df=catalog_df,
        embedding_index=embedding_index,
        image_base_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
        output_dir=os.path.join(PROJECT_ROOT, "data", "output", "recommendations")
    )
    
    # If no seed items provided, use first few wardrobe items
    if not seed_item_ids:
        available_ids = wardrobe_df['id'].head(2).tolist()
        seed_item_ids = available_ids
    
    if not seed_item_ids:
        logging.error("❌ No seed items available for recommendations!")
        return []
    
    logging.info(f"🌱 Using seed items: {seed_item_ids}")
    
    # Generate guaranteed recommendations
    outfits = recommender.recommend_outfits(
        seed_item_ids=seed_item_ids,
        occasion=occasion,
        num_outfits=num_outfits
    )
    
    logging.info(f"✅ Generated {len(outfits)} guaranteed outfit recommendations")
    return outfits


def display_recommendations(outfits: List[Dict]):
    """Display generated outfit recommendations"""
    if not outfits:
        logging.error("❌ No outfit recommendations generated!")
        return
    
    print("\n🎉 Outfit Recommendations:")
    print("=" * 50)
    
    for idx, outfit in enumerate(outfits, 1):
        print(f"\n👗 Outfit {idx} (Score: {outfit['score']:.2f})")
        print(f"   📝 {outfit['description']}")
        print(f"   🖼️  Image: {outfit['image_path']}")
        print(f"   🎯 Occasion: {outfit['occasion']}")
        
        print("   📋 Items:")
        for item in outfit['items']:
            category = item.get('category', 'Unknown')
            subcategory = item.get('subcategory', 'Unknown')
            color = item.get('primary_color', 'Unknown')
            style = item.get('style_tags', [])
            style_str = ', '.join(style) if style else 'Unknown'
            print(f"      • {category} - {subcategory} ({color}, {style_str})")
    
    print("\n" + "=" * 50)


def upload_new_item_interactive(data_manager: RobustDataManager) -> bool:
    """Interactive item upload functionality"""
    print("\n📤 Upload New Item")
    print("=" * 30)
    
    uploads_dir = os.path.join(PROJECT_ROOT, "data", "uploads")
    
    # Check for uploaded files
    uploaded_files = []
    for file in os.listdir(uploads_dir):
        if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            uploaded_files.append(os.path.join(uploads_dir, file))
    
    if not uploaded_files:
        print("❌ No images found in data/uploads folder!")
        print("   Please place your image files in the data/uploads folder and try again.")
        return False
    
    print(f"📸 Found {len(uploaded_files)} images to upload:")
    for i, file_path in enumerate(uploaded_files, 1):
        print(f"   [{i}] {os.path.basename(file_path)}")
    
    # Get user selection
    try:
        selection = input("\n🔢 Enter image number to upload (or Enter to skip): ").strip()
        if not selection:
            print("Skipping upload...")
            return False
        
        idx = int(selection) - 1
        if not (0 <= idx < len(uploaded_files)):
            print("Invalid selection!")
            return False
        
        selected_file = uploaded_files[idx]
        
        # Get optional item name
        item_name = input("Enter item name (optional): ").strip()
        if not item_name:
            item_name = None
        
        # Upload and process item
        new_item = data_manager.add_new_item(selected_file, item_name)
        
        print(f"\n✅ Successfully uploaded new item!")
        print(f"   Item ID: {new_item['id']}")
        print(f"   Category: {new_item['category']} - {new_item['subcategory']}")
        print(f"   Color: {new_item['dominant_color_name']}, Style: {new_item['style_tags']}")
        
        return True
        
    except (ValueError, IndexError) as e:
        print(f"❌ Error: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False


def interactive_mode():
    """Run in interactive mode for user selection"""
    print("\n🎮 Interactive Mode")
    print("=" * 30)
    
    # Initialize data manager
    data_manager = RobustDataManager(
        raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
        processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
        output_dir=os.path.join(PROJECT_ROOT, "data", "output")
    )
    
    # Load datasets
    wardrobe_df, catalog_df = data_manager.load_enhanced_datasets()
    
    if wardrobe_df.empty:
        print("❌ No wardrobe data found! Please run classification first.")
        return
    
    # Generate embeddings
    embedding_index = generate_embeddings(data_manager, wardrobe_df, catalog_df)
    
    # Ask if user wants to upload new items
    upload_choice = input("\n📤 Do you want to upload a new item? (y/n): ").strip().lower()
    if upload_choice == 'y':
        if upload_new_item_interactive(data_manager):
            # Reload datasets after upload
            wardrobe_df, catalog_df = data_manager.load_enhanced_datasets()
            embedding_index = generate_embeddings(data_manager, wardrobe_df, catalog_df)
    
    # Show available wardrobe items
    print("\n👗 Available Wardrobe Items:")
    for idx, (_, item) in enumerate(wardrobe_df.iterrows(), 1):
        category = item.get('category', 'Unknown')
        subcategory = item.get('subcategory', 'Unknown')
        color = item.get('dominant_color_name', 'Unknown')
        style = item.get('style_tags', 'Unknown')
        if isinstance(style, str):
            try:
                style = json.loads(style)
            except:
                style = [style]
        style_str = ', '.join(style) if isinstance(style, list) else str(style)
        source = item.get('source', 'curated')
        print(f"   [{idx}] {category} - {subcategory} ({color}, {style_str}) [{source}]")
    
    # Get user selection
    try:
        selection = input("\n🔢 Enter item numbers (comma-separated, e.g., 1,3,5): ").strip()
        if not selection:
            print("Using first 2 items as seeds...")
            seed_item_ids = wardrobe_df['id'].iloc[:2].tolist()
        else:
            indices = [int(x.strip()) - 1 for x in selection.split(',')]
            seed_item_ids = wardrobe_df.iloc[indices]['id'].tolist()
    except (ValueError, IndexError):
        print("Invalid selection! Using first 2 items...")
        seed_item_ids = wardrobe_df['id'].iloc[:2].tolist()
    
    # Get occasion
    occasions = ["casual", "formal", "semi_formal", "party", "wedding", "work", "beach", "sports"]
    print(f"\n🎯 Available occasions: {', '.join(occasions)}")
    occasion = input("Enter occasion (default: casual): ").strip().lower()
    if not occasion:
        occasion = "casual"
    
    # Generate guaranteed recommendations
    outfits = generate_guaranteed_recommendations(wardrobe_df, catalog_df, embedding_index, seed_item_ids, occasion)
    display_recommendations(outfits)


def run_complete_pipeline(seed_item_ids: List[int] = None, occasion: str = "casual", 
                         max_wardrobe_items: int = 10, num_outfits: int = 3):
    """Run the complete enhanced recommendation pipeline"""
    logging.info("🚀 Running complete enhanced recommendation pipeline...")
    
    # Initialize data manager
    data_manager = RobustDataManager(
        raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
        processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
        output_dir=os.path.join(PROJECT_ROOT, "data", "output")
    )
    
    # Step 1: Classify images
    style_df = classify_new_images(data_manager)
    
    # Step 2: Create enhanced datasets
    wardrobe_df, catalog_df = create_enhanced_datasets(data_manager, max_wardrobe_items)
    
    # Step 3: Generate embeddings
    embedding_index = generate_embeddings(data_manager, wardrobe_df, catalog_df)
    
    # Step 4: Generate recommendations
    outfits = generate_guaranteed_recommendations(wardrobe_df, catalog_df, embedding_index, seed_item_ids, occasion, num_outfits)
    display_recommendations(outfits)
    
    return outfits


def main():
    """Main function"""
    parser = argparse.ArgumentParser(description="Enhanced Fashion Recommendation System")
    parser.add_argument("--classify", action="store_true", help="Classify new images")
    parser.add_argument("--create-datasets", action="store_true", help="Create enhanced datasets")
    parser.add_argument("--generate-embeddings", action="store_true", help="Generate embeddings")
    parser.add_argument("--recommend", action="store_true", help="Generate recommendations")
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    parser.add_argument("--upload", action="store_true", help="Upload new items")
    parser.add_argument("--seed", type=str, default="", help="Comma-separated seed item IDs")
    parser.add_argument("--occasion", type=str, default="casual", help="Target occasion")
    parser.add_argument("--max-wardrobe", type=int, default=10, help="Maximum wardrobe items")
    parser.add_argument("--num-outfits", type=int, default=3, help="Number of outfits to generate")
    parser.add_argument("--all", action="store_true", help="Run all steps")
    parser.add_argument("--dry-run", action="store_true", help="Run without making changes")
    
    args = parser.parse_args()
    
    # Setup logging
    log_file = setup_logging()
    logging.info(f"Starting enhanced fashion recommendation system (log: {log_file})")
    
    # Ensure directories exist
    ensure_directories()
    
    # Parse seed items
    seed_item_ids = []
    if args.seed:
        try:
            # Handle both string and integer IDs
            seed_item_ids = [x.strip() for x in args.seed.split(',')]
        except ValueError:
            logging.error("Invalid seed IDs format!")
            return
    
    if args.dry_run:
        logging.info("🔍 Dry run mode - no changes will be made")
        return
    
    if args.all or not any([args.classify, args.create_datasets, args.generate_embeddings, args.recommend, args.interactive, args.upload]):
        # Run all steps by default
        run_complete_pipeline(seed_item_ids, args.occasion, args.max_wardrobe, args.num_outfits)
    
    else:
        # Run specific steps
        if args.classify:
            data_manager = RobustDataManager(
                raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
                processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
                output_dir=os.path.join(PROJECT_ROOT, "data", "output")
            )
            classify_new_images(data_manager)
        
        if args.create_datasets:
            data_manager = RobustDataManager(
                raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
                processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
                output_dir=os.path.join(PROJECT_ROOT, "data", "output")
            )
            create_enhanced_datasets(data_manager, args.max_wardrobe)
        
        if args.generate_embeddings:
            data_manager = RobustDataManager(
                raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
                processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
                output_dir=os.path.join(PROJECT_ROOT, "data", "output")
            )
            wardrobe_df, catalog_df = data_manager.load_enhanced_datasets()
            generate_embeddings(data_manager, wardrobe_df, catalog_df)
        
        if args.upload:
            data_manager = RobustDataManager(
                raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
                processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
                output_dir=os.path.join(PROJECT_ROOT, "data", "output")
            )
            upload_new_item_interactive(data_manager)
        
        if args.recommend:
            data_manager = RobustDataManager(
                raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
                processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
                output_dir=os.path.join(PROJECT_ROOT, "data", "output")
            )
            wardrobe_df, catalog_df = data_manager.load_enhanced_datasets()
            embedding_index = generate_embeddings(data_manager, wardrobe_df, catalog_df)
            outfits = generate_guaranteed_recommendations(wardrobe_df, catalog_df, embedding_index, seed_item_ids, args.occasion, args.num_outfits)
            display_recommendations(outfits)
        
        if args.interactive:
            interactive_mode()
    
    logging.info("✅ Enhanced fashion recommendation system completed")


if __name__ == "__main__":
    main()