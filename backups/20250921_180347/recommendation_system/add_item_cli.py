#!/usr/bin/env python3
"""
CLI processor for adding items to the recommendation system
Usage: python add_item_cli.py --file /path/to/image --main_category top
"""

import os
import sys
import json
import argparse
import uuid
from datetime import datetime
from pathlib import Path

# Add src to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from src.data.robust_data_manager import RobustDataManager
from src.classify.robust_classifier import RobustClassifier


def main():
    parser = argparse.ArgumentParser(description='Process image and add to recommendation system')
    parser.add_argument('--file', required=True, help='Path to image file')
    parser.add_argument('--main_category', required=True, 
                       choices=['tops', 'bottoms', 'shoes', 'accessories', 'dresses'],
                       help='Main category from user selection')
    parser.add_argument('--source', default='wardrobe', 
                       choices=['wardrobe', 'myntra'],
                       help='Source of the item')
    
    args = parser.parse_args()
    
    # Validate file exists
    if not os.path.exists(args.file):
        print(json.dumps({"status": "error", "error": f"File not found: {args.file}"}))
        sys.exit(1)
    
    try:
        # Initialize components
        data_manager = RobustDataManager(
            raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
            processed_dir=os.path.join(PROJECT_ROOT, "data", "processed"),
            output_dir=os.path.join(PROJECT_ROOT, "data", "output")
        )
        
        classifier = RobustClassifier()
        
        # Generate unique filename
        file_ext = os.path.splitext(args.file)[1]
        unique_filename = f"{uuid.uuid4()}{file_ext}"
        
        # Copy image to data/raw/images/
        images_dir = os.path.join(PROJECT_ROOT, "data", "raw", "images")
        os.makedirs(images_dir, exist_ok=True)
        dest_path = os.path.join(images_dir, unique_filename)
        
        import shutil
        shutil.copy2(args.file, dest_path)
        
        # Classify the image
        classification = classifier.classify_image(dest_path)
        classification['filename'] = dest_path
        
        # Override category with user selection
        classification['category'] = args.main_category
        
        # Generate embedding
        embedding = classifier.get_image_embedding(dest_path)
        
        # Create unique ID
        item_id = f"user_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{uuid.uuid4().hex[:8]}"
        
        # Create style row
        style_df_path = os.path.join(PROJECT_ROOT, "data", "processed", "style.csv")
        
        if os.path.exists(style_df_path):
            import pandas as pd
            style_df = pd.read_csv(style_df_path)
        else:
            # Create new style.csv with proper schema
            style_df = pd.DataFrame(columns=data_manager.create_style_csv_schema())
        
        # Create new row
        new_row = data_manager._create_style_row(classification, len(style_df))
        new_row['id'] = item_id
        new_row['source'] = args.source
        new_row['filename'] = dest_path
        
        # Add to style.csv
        style_df = pd.concat([style_df, pd.DataFrame([new_row])], ignore_index=True)
        style_df.to_csv(style_df_path, index=False)
        
        # Update enhanced datasets (only if parquet support is available)
        try:
            wardrobe_path = os.path.join(PROJECT_ROOT, "data", "processed", "enhanced_wardrobe.parquet")
            if os.path.exists(wardrobe_path):
                wardrobe_df = pd.read_parquet(wardrobe_path)
                new_row['source'] = 'wardrobe'
                wardrobe_df = pd.concat([wardrobe_df, pd.DataFrame([new_row])], ignore_index=True)
                wardrobe_df.to_parquet(wardrobe_path, index=False)
        except Exception as e:
            print(f"Warning: Could not update parquet files: {e}", file=sys.stderr)
        
        # Update embeddings
        if embedding is not None:
            update_embeddings(item_id, embedding, PROJECT_ROOT)
        
        # Return success response
        result = {
            "status": "ok",
            "metadata": {
                "id": item_id,
                "filename": dest_path,
                "category": args.main_category,
                "subcategory": classification.get('subcategory', 'unknown'),
                "source": args.source,
                "created_at": datetime.now().isoformat(),
                "embedding_generated": embedding is not None,
                "classification": classification
            }
        }
        
        print(json.dumps(result))
        sys.exit(0)
        
    except Exception as e:
        error_result = {
            "status": "error",
            "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)


def update_embeddings(item_id, embedding, project_root):
    """Update embeddings with new item"""
    try:
        import numpy as np
        
        # Load existing embeddings
        embeddings_dir = os.path.join(project_root, "data", "processed", "embeddings")
        os.makedirs(embeddings_dir, exist_ok=True)
        
        wardrobe_emb_path = os.path.join(embeddings_dir, "wardrobe_embeddings.npz")
        
        if os.path.exists(wardrobe_emb_path):
            wardrobe_data = np.load(wardrobe_emb_path)
            wardrobe_embeddings = wardrobe_data['embeddings']
            wardrobe_ids = wardrobe_data['ids'].tolist()
            
            # Add new embedding
            wardrobe_embeddings = np.vstack([wardrobe_embeddings, embedding.reshape(1, -1)])
            wardrobe_ids.append(item_id)
            
            # Save updated embeddings
            np.savez(wardrobe_emb_path, 
                    embeddings=wardrobe_embeddings, 
                    ids=wardrobe_ids)
        
    except Exception as e:
        print(f"Warning: Could not update embeddings: {e}", file=sys.stderr)


if __name__ == "__main__":
    main()
