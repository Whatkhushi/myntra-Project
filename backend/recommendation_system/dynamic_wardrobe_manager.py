#!/usr/bin/env python3
"""
Dynamic Wardrobe Manager
Handles in-memory updates to wardrobe data structures when new items are added
"""

import os
import sys
import json
import pandas as pd
import numpy as np
from typing import List, Dict, Tuple, Optional
from datetime import datetime

# Add src to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
SRC_DIR = os.path.join(PROJECT_ROOT, "src")
if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

from data.robust_data_manager import RobustDataManager, EmbeddingIndex
from classify.robust_classifier import RobustClassifier

class DynamicWardrobeManager:
    """Manages dynamic updates to wardrobe data structures"""
    
    def __init__(self, processed_dir: str, output_dir: str):
        self.processed_dir = processed_dir
        self.output_dir = output_dir
        self.classifier = RobustClassifier()
        self.data_manager = RobustDataManager(
            raw_dir=os.path.join(PROJECT_ROOT, "data", "raw"),
            processed_dir=processed_dir,
            output_dir=output_dir
        )
        
        # In-memory data structures
        self.wardrobe_df = None
        self.catalog_df = None
        self.embedding_index = EmbeddingIndex(embeddings_dir=processed_dir)
        self.style_df = None
        
    def load_existing_data(self):
        """Load existing wardrobe and catalog data"""
        print("📊 Loading existing wardrobe data...")
        
        # Load style.csv
        style_csv_path = os.path.join(self.processed_dir, 'style.csv')
        if os.path.exists(style_csv_path):
            self.style_df = pd.read_csv(style_csv_path)
            print(f"✅ Loaded {len(self.style_df)} items from style.csv")
        else:
            print("❌ No style.csv found!")
            return False
            
        # Load wardrobe and catalog
        wardrobe_path = os.path.join(self.processed_dir, 'enhanced_wardrobe.parquet')
        catalog_path = os.path.join(self.processed_dir, 'enhanced_catalog.parquet')
        
        if os.path.exists(wardrobe_path):
            self.wardrobe_df = pd.read_parquet(wardrobe_path)
            print(f"✅ Loaded {len(self.wardrobe_df)} wardrobe items")
        else:
            print("❌ No wardrobe data found!")
            return False
            
        if os.path.exists(catalog_path):
            self.catalog_df = pd.read_parquet(catalog_path)
            print(f"✅ Loaded {len(self.catalog_df)} catalog items")
        else:
            print("❌ No catalog data found!")
            return False
            
        # Load embeddings using the existing structure
        wardrobe_emb_path = os.path.join(self.processed_dir, 'wardrobe_embeddings.npz')
        catalog_emb_path = os.path.join(self.processed_dir, 'catalog_embeddings.npz')
        
        if os.path.exists(wardrobe_emb_path) and os.path.exists(catalog_emb_path):
            self.embedding_index = EmbeddingIndex(embeddings_dir=self.processed_dir)
            self.embedding_index.load_embeddings()
            print(f"✅ Loaded embeddings for wardrobe and catalog items")
        else:
            # Try to load from the unified embedding format
            embeddings_path = os.path.join(self.processed_dir, 'embeddings.npy')
            emb_index_path = os.path.join(self.processed_dir, 'emb_index.json')
            
            if os.path.exists(embeddings_path) and os.path.exists(emb_index_path):
                print("📊 Loading unified embeddings...")
                # Load the unified embeddings and split them
                all_embeddings = np.load(embeddings_path)
                with open(emb_index_path, 'r') as f:
                    id_to_index = json.load(f)
                
                # Split embeddings into wardrobe and catalog
                wardrobe_embeddings = []
                wardrobe_ids = []
                catalog_embeddings = []
                catalog_ids = []
                
                for item_id, emb_index in id_to_index.items():
                    if item_id in self.wardrobe_df['id'].values:
                        wardrobe_embeddings.append(all_embeddings[emb_index])
                        wardrobe_ids.append(item_id)
                    elif item_id in self.catalog_df['id'].values:
                        catalog_embeddings.append(all_embeddings[emb_index])
                        catalog_ids.append(item_id)
                
                # Create the embedding index
                self.embedding_index = EmbeddingIndex(embeddings_dir=self.processed_dir)
                if wardrobe_embeddings:
                    self.embedding_index._wardrobe_emb = np.array(wardrobe_embeddings)
                    self.embedding_index._wardrobe_ids = wardrobe_ids
                if catalog_embeddings:
                    self.embedding_index._catalog_emb = np.array(catalog_embeddings)
                    self.embedding_index._catalog_ids = catalog_ids
                
                print(f"✅ Loaded unified embeddings: {len(wardrobe_ids)} wardrobe, {len(catalog_ids)} catalog")
            else:
                print("❌ No embeddings found!")
                return False
            
        return True
    
    def add_new_item_dynamically(self, image_path: str, user_category: str) -> Optional[Dict]:
        """Add a new item to the wardrobe dynamically"""
        print(f"➕ Adding new item: {os.path.basename(image_path)}")
        
        try:
            # Classify the new item
            classification_result = self.classifier.classify_image(image_path)
            classification_result['category'] = user_category
            
            # Get image properties
            from PIL import Image
            with Image.open(image_path) as img:
                width, height = img.size
            
            # Generate unique item ID
            item_id = f"new_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{str(hash(image_path))[:8]}"
            
            # Create metadata entry
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
                'secondary_colors': json.dumps(classification_result.get('secondary_colors', [])),
                'colorfulness_score': classification_result.get('colorfulness_score', 0.0),
                'brightness_score': classification_result.get('brightness_score', 1.0),
                'emb_index': -1,  # Will be updated
                'width_px': width,
                'height_px': height,
                'bbox_garment': classification_result.get('bbox_garment', ''),
                'created_at': datetime.now().isoformat()
            }
            
            # Generate embedding for the new item
            print("🧠 Generating embedding for new item...")
            new_embedding = self.classifier.get_image_embedding(image_path)
            if new_embedding is None:
                print("❌ Failed to generate embedding for new item")
                return None
            
            # Update in-memory data structures
            self._update_in_memory_data(metadata, new_embedding)
            
            # Save to style.csv
            self._save_to_style_csv(metadata)
            
            print(f"✅ Successfully added new item: {item_id}")
            print(f"   Category: {user_category}")
            print(f"   Subcategory: {metadata['subcategory']}")
            print(f"   Style tags: {json.loads(metadata['style_tags'])}")
            
            return metadata
            
        except Exception as e:
            print(f"❌ Error adding new item: {e}")
            return None
    
    def _update_in_memory_data(self, metadata: Dict, new_embedding: np.ndarray):
        """Update in-memory data structures with new item"""
        print("🔄 Updating in-memory data structures...")
        
        # Add to style_df
        new_row = pd.DataFrame([metadata])
        self.style_df = pd.concat([self.style_df, new_row], ignore_index=True)
        
        # Add to wardrobe_df
        wardrobe_metadata = metadata.copy()
        wardrobe_metadata['source'] = 'wardrobe'
        wardrobe_row = pd.DataFrame([wardrobe_metadata])
        self.wardrobe_df = pd.concat([self.wardrobe_df, wardrobe_row], ignore_index=True)
        
        # Update wardrobe embeddings
        if self.embedding_index._wardrobe_emb is None:
            self.embedding_index._wardrobe_emb = new_embedding.reshape(1, -1)
            self.embedding_index._wardrobe_ids = [metadata['id']]
        else:
            self.embedding_index._wardrobe_emb = np.vstack([self.embedding_index._wardrobe_emb, new_embedding.reshape(1, -1)])
            self.embedding_index._wardrobe_ids.append(metadata['id'])
        
        # Update metadata emb_index
        metadata['emb_index'] = len(self.embedding_index._wardrobe_ids) - 1
        wardrobe_metadata['emb_index'] = len(self.embedding_index._wardrobe_ids) - 1
        
        print(f"✅ Updated in-memory data structures")
        print(f"   Total wardrobe items: {len(self.wardrobe_df)}")
        print(f"   Total wardrobe embeddings: {len(self.embedding_index._wardrobe_ids)}")
    
    def _save_to_style_csv(self, metadata: Dict):
        """Save new item to style.csv"""
        print("💾 Saving new item to style.csv...")
        
        # Update the style_df with the new emb_index
        self.style_df.loc[self.style_df['id'] == metadata['id'], 'emb_index'] = metadata['emb_index']
        
        # Save to file
        style_csv_path = os.path.join(self.processed_dir, 'style.csv')
        self.style_df.to_csv(style_csv_path, index=False)
        
        # Also save updated wardrobe and catalog
        wardrobe_path = os.path.join(self.processed_dir, 'enhanced_wardrobe.parquet')
        catalog_path = os.path.join(self.processed_dir, 'enhanced_catalog.parquet')
        
        self.wardrobe_df.to_parquet(wardrobe_path, index=False)
        self.catalog_df.to_parquet(catalog_path, index=False)
        
        # Save updated wardrobe embeddings
        wardrobe_emb_path = os.path.join(self.processed_dir, 'wardrobe_embeddings.npz')
        np.savez(wardrobe_emb_path, 
                embeddings=self.embedding_index._wardrobe_emb,
                ids=self.embedding_index._wardrobe_ids)
        
        print("✅ Saved updated data to files")
    
    def get_wardrobe_items(self) -> pd.DataFrame:
        """Get current wardrobe items"""
        return self.wardrobe_df.copy()
    
    def get_catalog_items(self) -> pd.DataFrame:
        """Get current catalog items"""
        return self.catalog_df.copy()
    
    def get_embedding_index(self) -> EmbeddingIndex:
        """Get current embedding index"""
        return self.embedding_index
    
    def get_style_data(self) -> pd.DataFrame:
        """Get current style data"""
        return self.style_df.copy()
