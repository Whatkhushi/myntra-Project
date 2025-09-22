from __future__ import annotations

import os
import json
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from pathlib import Path
import shutil
from datetime import datetime

from src.classify.robust_classifier import RobustClassifier


@dataclass
class EmbeddingIndex:
    """Simple embedding index for storing and retrieving embeddings"""
    embeddings_dir: str
    _wardrobe_emb: Optional[np.ndarray] = None
    _catalog_emb: Optional[np.ndarray] = None
    _wardrobe_ids: Optional[List[str]] = None
    _catalog_ids: Optional[List[str]] = None
    
    def load_embeddings(self):
        """Load embeddings from files"""
        try:
            # Load wardrobe embeddings
            wardrobe_emb_path = os.path.join(self.embeddings_dir, "wardrobe_embeddings.npz")
            if os.path.exists(wardrobe_emb_path):
                wardrobe_data = np.load(wardrobe_emb_path)
                self._wardrobe_emb = wardrobe_data['embeddings']
                self._wardrobe_ids = wardrobe_data['ids'].tolist()
            
            # Load catalog embeddings
            catalog_emb_path = os.path.join(self.embeddings_dir, "catalog_embeddings.npz")
            if os.path.exists(catalog_emb_path):
                catalog_data = np.load(catalog_emb_path)
                self._catalog_emb = catalog_data['embeddings']
                self._catalog_ids = catalog_data['ids'].tolist()
        except Exception as e:
            print(f"Warning: Could not load embeddings: {e}")
    
    def get_embedding(self, item_id: str) -> Optional[np.ndarray]:
        """Get embedding for a specific item"""
        try:
            # Check if it's a wardrobe item
            if self._wardrobe_emb is not None and self._wardrobe_ids is not None:
                for idx, wid in enumerate(self._wardrobe_ids):
                    if str(wid) == str(item_id):
                        return self._wardrobe_emb[idx]

            # Check if it's a catalog item
            if self._catalog_emb is not None and self._catalog_ids is not None:
                for idx, cid in enumerate(self._catalog_ids):
                    if str(cid) == str(item_id):
                        return self._catalog_emb[idx]

            return None
        except Exception as e:
            print(f"Warning: Could not get embedding for {item_id}: {e}")
            return None
    
    def cosine_similarity(self, emb1: np.ndarray, emb2: np.ndarray) -> float:
        """Calculate cosine similarity between two embeddings"""
        try:
            # Normalize embeddings
            emb1_norm = emb1 / np.linalg.norm(emb1)
            emb2_norm = emb2 / np.linalg.norm(emb2)
            
            # Calculate cosine similarity
            similarity = np.dot(emb1_norm, emb2_norm)
            return float(similarity)
        except Exception as e:
            print(f"Warning: Could not calculate cosine similarity: {e}")
            return 0.0
    
    def build_or_load(self, wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame, force_rebuild: bool = False, image_base_dir: str = None, show_progress: bool = False):
        """Build or load embeddings for the given datasets"""
        try:
            # Create embeddings directory if it doesn't exist
            os.makedirs(self.embeddings_dir, exist_ok=True)
            
            # Check if embeddings already exist and we don't want to force rebuild
            wardrobe_emb_path = os.path.join(self.embeddings_dir, "wardrobe_embeddings.npz")
            catalog_emb_path = os.path.join(self.embeddings_dir, "catalog_embeddings.npz")
            
            if not force_rebuild and os.path.exists(wardrobe_emb_path) and os.path.exists(catalog_emb_path):
                print("📁 Loading existing embeddings...")
                self.load_embeddings()
                return
            
            print("🔨 Building new embeddings...")
            
            # Import here to avoid circular imports
            from src.classify.robust_classifier import RobustClassifier
            
            # Initialize classifier
            classifier = RobustClassifier()
            
            # Generate embeddings for wardrobe
            if not wardrobe_df.empty:
                print(f"🧠 Generating embeddings for {len(wardrobe_df)} wardrobe items...")
                wardrobe_embeddings = []
                wardrobe_ids = []
                
                for idx, row in wardrobe_df.iterrows():
                    try:
                        img_path = row['filename']
                        if os.path.exists(img_path):
                            embedding = classifier.get_image_embedding(img_path)
                            if embedding is not None:
                                wardrobe_embeddings.append(embedding)
                                wardrobe_ids.append(row['id'])
                    except Exception as e:
                        print(f"Warning: Could not generate embedding for {row['id']}: {e}")
                
                if wardrobe_embeddings:
                    self._wardrobe_emb = np.array(wardrobe_embeddings)
                    self._wardrobe_ids = wardrobe_ids
                    
                    # Save wardrobe embeddings
                    np.savez(wardrobe_emb_path, 
                            embeddings=self._wardrobe_emb, 
                            ids=self._wardrobe_ids)
                    print(f"💾 Saved wardrobe embeddings: {len(wardrobe_embeddings)} items")
            
            # Generate embeddings for catalog
            if not catalog_df.empty:
                print(f"🧠 Generating embeddings for {len(catalog_df)} catalog items...")
                catalog_embeddings = []
                catalog_ids = []
                
                for idx, row in catalog_df.iterrows():
                    try:
                        img_path = row['filename']
                        if os.path.exists(img_path):
                            embedding = classifier.get_image_embedding(img_path)
                            if embedding is not None:
                                catalog_embeddings.append(embedding)
                                catalog_ids.append(row['id'])
                    except Exception as e:
                        print(f"Warning: Could not generate embedding for {row['id']}: {e}")
                
                if catalog_embeddings:
                    self._catalog_emb = np.array(catalog_embeddings)
                    self._catalog_ids = catalog_ids
                    
                    # Save catalog embeddings
                    np.savez(catalog_emb_path, 
                            embeddings=self._catalog_emb, 
                            ids=self._catalog_ids)
                    print(f"💾 Saved catalog embeddings: {len(catalog_embeddings)} items")
            
            print("✅ Embeddings generated successfully")
            
        except Exception as e:
            print(f"Error building/loading embeddings: {e}")
            raise


@dataclass
class RobustDataManager:
    raw_dir: str
    processed_dir: str
    output_dir: str
    
    def __post_init__(self):
        os.makedirs(self.processed_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
        self.classifier = RobustClassifier()
    
    def create_style_csv_schema(self) -> List[str]:
        """Return the exact CSV schema as specified"""
        return [
            'id', 'filename', 'source', 'category', 'category_conf', 'subcategory', 'subcategory_conf',
            'neckline', 'neckline_conf', 'sleeve_length', 'sleeve_length_conf',
            'length_type', 'length_conf', 'fit', 'fit_conf', 'silhouette', 'silhouette_conf',
            'fabric_type', 'fabric_conf', 'pattern', 'pattern_confidence', 'pattern_scale',
            'style_tags', 'style_confidence', 'formality', 'formality_conf', 'season', 'season_conf',
            'tradition', 'tradition_conf', 'gender_target', 'gender_conf',
            'dominant_color_hex', 'dominant_color_name', 'dominant_color_h', 'dominant_color_s', 'dominant_color_v',
            'secondary_colors', 'colorfulness_score', 'brightness_score',
            'emb_index', 'width_px', 'height_px', 'bbox_garment', 'created_at'
        ]
    
    def process_image_classifications(self, image_paths: List[str]) -> pd.DataFrame:
        """Process images and create comprehensive dataset with exact schema"""
        print("🔍 Processing image classifications with robust heuristics...")
        
        # Classify all images
        classifications = self.classifier.classify_batch(image_paths, show_progress=True)
        
        # Convert to DataFrame with exact schema
        rows = []
        for i, classification in enumerate(classifications):
            row = self._create_style_row(classification, i)
            rows.append(row)
        
        df = pd.DataFrame(rows)
        
        # Save to CSV
        csv_path = os.path.join(self.processed_dir, 'style.csv')
        df.to_csv(csv_path, index=False)
        
        print(f"✅ Created style.csv with {len(df)} items")
        
        # Organize classified images into folders
        self._organize_classified_images(df)
        
        return df
    
    def _organize_classified_images(self, df: pd.DataFrame):
        """Organize classified images into folders by category and subcategory"""
        try:
            # Create organized images directory
            organized_dir = os.path.join(self.output_dir, 'organized')
            os.makedirs(organized_dir, exist_ok=True)
            
            print("📁 Organizing classified images into folders...")
            
            for idx, row in df.iterrows():
                try:
                    # Get source and destination paths
                    source_path = row['filename']
                    if not os.path.exists(source_path):
                        continue
                    
                    # Create folder structure: category/subcategory/
                    category = row['category'].replace('_', ' ').title()
                    subcategory = row['subcategory'].replace('_', ' ').title()
                    
                    category_dir = os.path.join(organized_dir, category)
                    subcategory_dir = os.path.join(category_dir, subcategory)
                    os.makedirs(subcategory_dir, exist_ok=True)
                    
                    # Copy image to organized folder
                    filename = os.path.basename(source_path)
                    dest_path = os.path.join(subcategory_dir, filename)
                    
                    if not os.path.exists(dest_path):
                        import shutil
                        shutil.copy2(source_path, dest_path)
                    
                    # Update the filename in the dataframe to point to organized location
                    df.at[idx, 'filename'] = dest_path
                    
                except Exception as e:
                    print(f"Warning: Could not organize image {row.get('id', 'unknown')}: {e}")
                    continue
            
            # Save updated CSV with organized paths
            csv_path = os.path.join(self.processed_dir, 'style.csv')
            df.to_csv(csv_path, index=False)
            
            print(f"✅ Organized images into folders in {organized_dir}")
            
        except Exception as e:
            print(f"Warning: Could not organize images: {e}")
    
    def _create_style_row(self, classification: Dict, index: int) -> Dict:
        """Create a row with the exact CSV schema"""
        additional_details = classification.get('additional_details', {})
        
        # Map occasion to formality
        occasion = classification.get('occasion', 'casual')
        formality_map = {
            'casual': 'casual',
            'formal': 'formal',
            'semi_formal': 'semi_formal',
            'party': 'party',
            'wedding': 'formal',
            'work': 'semi_formal',
            'beach': 'casual',
            'sports': 'casual'
        }
        formality = formality_map.get(occasion, 'casual')
        
        # Determine length type based on category and subcategory
        category = classification.get('category', '')
        subcategory = classification.get('subcategory', '')
        length_type = self._determine_length_type(category, subcategory)
        
        # Determine silhouette
        silhouette = self._determine_silhouette(category, subcategory, additional_details)
        
        # Pattern scale
        pattern = classification.get('pattern', 'solid')
        pattern_scale = self._determine_pattern_scale(pattern)
        
        # Secondary colors (empty for now, could be enhanced)
        secondary_colors = []
        
        # Bounding box (empty for now, could be enhanced with object detection)
        bbox_garment = ""
        
        return {
            'id': f"item_{index:03d}",
            'filename': classification.get('filename', ''),
            'source': 'curated',
            'category': classification.get('category', ''),
            'category_conf': classification.get('category_conf', 0.0),
            'subcategory': classification.get('subcategory', ''),
            'subcategory_conf': classification.get('subcategory_conf', 0.0),
            'neckline': additional_details.get('neckline', ''),
            'neckline_conf': additional_details.get('neckline_conf', 0.0),
            'sleeve_length': additional_details.get('sleeve_length', ''),
            'sleeve_length_conf': additional_details.get('sleeve_length_conf', 0.0),
            'length_type': length_type,
            'length_conf': 0.8,  # Default confidence
            'fit': additional_details.get('fit', ''),
            'fit_conf': additional_details.get('fit_conf', 0.0),
            'silhouette': silhouette,
            'silhouette_conf': 0.7,  # Default confidence
            'fabric_type': classification.get('fabric', ''),
            'fabric_conf': classification.get('fabric_conf', 0.0),
            'pattern': classification.get('pattern', ''),
            'pattern_confidence': classification.get('pattern_confidence', 0.0),
            'pattern_scale': pattern_scale,
            'style_tags': json.dumps(classification.get('style_tags', [])),
            'style_confidence': json.dumps(classification.get('style_confidence', [])),
            'formality': formality,
            'formality_conf': classification.get('occasion_conf', 0.0),
            'season': classification.get('season', ''),
            'season_conf': classification.get('season_conf', 0.0),
            'tradition': classification.get('tradition', ''),
            'tradition_conf': classification.get('tradition_conf', 0.0),
            'gender_target': classification.get('gender', ''),
            'gender_conf': classification.get('gender_conf', 0.0),
            'dominant_color_hex': classification.get('dominant_color_hex', ''),
            'dominant_color_name': classification.get('dominant_color_name', ''),
            'dominant_color_h': classification.get('dominant_color_h', 0),
            'dominant_color_s': classification.get('dominant_color_s', 0),
            'dominant_color_v': classification.get('dominant_color_v', 0),
            'secondary_colors': json.dumps(secondary_colors),
            'colorfulness_score': classification.get('colorfulness_score', 0.0),
            'brightness_score': classification.get('brightness_score', 0.0),
            'emb_index': index,  # Will be updated when embeddings are generated
            'width_px': classification.get('width_px', 0),
            'height_px': classification.get('height_px', 0),
            'bbox_garment': bbox_garment,
            'created_at': datetime.now().isoformat()
        }
    
    def _determine_length_type(self, category: str, subcategory: str) -> str:
        """Determine length type based on category and subcategory"""
        if category == 'dress':
            if 'maxi' in subcategory.lower():
                return 'maxi'
            elif 'midi' in subcategory.lower():
                return 'midi'
            elif 'mini' in subcategory.lower():
                return 'mini'
            else:
                return 'midi'  # Default
        elif category == 'bottom':
            if 'shorts' in subcategory.lower():
                return 'short'
            elif 'capri' in subcategory.lower():
                return 'capri'
            else:
                return 'full_length'
        elif category in ['top', 'lehenga_set', 'saree']:
            if 'crop' in subcategory.lower():
                return 'crop'
            else:
                return 'regular'
        else:
            return 'regular'
    
    def _determine_silhouette(self, category: str, subcategory: str, additional_details: Dict) -> str:
        """Determine silhouette based on category and fit"""
        fit = additional_details.get('fit', 'regular')
        
        if category in ['dress', 'top', 'lehenga_set']:
            if fit == 'fitted':
                return 'fitted'
            elif fit == 'loose':
                return 'loose'
            elif fit == 'oversized':
                return 'oversized'
            else:
                return 'regular'
        elif category == 'bottom':
            if 'skinny' in subcategory.lower():
                return 'skinny'
            elif 'wide' in subcategory.lower():
                return 'wide'
            else:
                return 'regular'
        else:
            return 'regular'
    
    def _determine_pattern_scale(self, pattern: str) -> str:
        """Determine pattern scale"""
        if pattern == 'solid':
            return 'none'
        elif pattern in ['polka_dot', 'small_prints']:
            return 'small'
        elif pattern in ['striped', 'checked', 'plaid']:
            return 'medium'
        elif pattern in ['floral', 'abstract', 'geometric']:
            return 'large'
        else:
            return 'medium'
    
    def create_enhanced_datasets(self, max_wardrobe_items: int = 15) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Create enhanced datasets with comprehensive features"""
        print("📊 Creating enhanced datasets...")
        
        # Load or create style dataset
        style_csv_path = os.path.join(self.processed_dir, 'style.csv')
        if os.path.exists(style_csv_path):
            print("📁 Loading existing style dataset...")
            style_df = pd.read_csv(style_csv_path)
        else:
            print("🔍 Creating new style dataset...")
            # Get all image files
            image_paths = []
            raw_images_dir = os.path.join(self.raw_dir, 'images')
            for root, dirs, files in os.walk(raw_images_dir):
                for file in files:
                    if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                        image_paths.append(os.path.join(root, file))
            
            if not image_paths:
                print("❌ No images found in raw/images folder!")
                return pd.DataFrame(), pd.DataFrame()
            
            style_df = self.process_image_classifications(image_paths)
        
        # Split into wardrobe and catalog with vibe distribution
        wardrobe_df, catalog_df = self._split_datasets_with_vibe_distribution(style_df, max_wardrobe_items)
        
        # Save datasets
        wardrobe_path = os.path.join(self.processed_dir, 'enhanced_wardrobe.parquet')
        catalog_path = os.path.join(self.processed_dir, 'enhanced_catalog.parquet')
        
        wardrobe_df.to_parquet(wardrobe_path, index=False)
        catalog_df.to_parquet(catalog_path, index=False)
        
        print(f"✅ Created enhanced datasets:")
        print(f"   👗 User Wardrobe: {len(wardrobe_df)} items")
        print(f"   🛍️  Myntra Database: {len(catalog_df)} items")
        
        return wardrobe_df, catalog_df
    
    def _split_datasets(self, style_df: pd.DataFrame, max_wardrobe_items: int) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split dataset into wardrobe and catalog"""
        # Ensure we have enough items
        if len(style_df) < max_wardrobe_items:
            max_wardrobe_items = len(style_df)
        
        # Select wardrobe items (first max_wardrobe_items)
        wardrobe_df = style_df.head(max_wardrobe_items).copy()
        wardrobe_df['source'] = 'wardrobe'
        
        # Rest go to catalog
        catalog_df = style_df.iloc[max_wardrobe_items:].copy()
        catalog_df['source'] = 'catalog'
        
        return wardrobe_df, catalog_df
    
    def _split_datasets_with_vibe_distribution(self, style_df: pd.DataFrame, max_wardrobe_items: int = 15) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Split dataset into wardrobe and catalog with vibe-based distribution"""
        print("🎨 Creating wardrobe with vibe distribution...")
        
        # Ensure we have enough items
        if len(style_df) < max_wardrobe_items:
            max_wardrobe_items = len(style_df)
        
        # Parse style_tags to extract primary vibes
        def get_primary_vibe(style_tags_str):
            if pd.isna(style_tags_str) or style_tags_str == '':
                return 'casual'  # Default vibe
            try:
                import json
                if isinstance(style_tags_str, str):
                    style_tags = json.loads(style_tags_str)
                else:
                    style_tags = style_tags_str
                if isinstance(style_tags, list) and len(style_tags) > 0:
                    return style_tags[0]  # Use first style tag as primary vibe
                return 'casual'
            except:
                return 'casual'
        
        style_df['primary_vibe'] = style_df['style_tags'].apply(get_primary_vibe)
        
        # Required categories for balanced wardrobe
        required_categories = {
            'top': 2,
            'bottom': 2, 
            'shoes': 2,
            'accessories': 2,
            'bag': 1,
            'dress': 1
        }
        
        # Vibe distribution: 50% (7-8 items), 30% (4-5 items), 20% (2-3 items)
        vibe_distribution = {
            'primary': 0.50,    # 7-8 items
            'secondary': 0.30,  # 4-5 items  
            'tertiary': 0.20    # 2-3 items
        }
        
        # Find the most common vibes
        vibe_counts = style_df['primary_vibe'].value_counts()
        top_vibes = vibe_counts.head(3).index.tolist()
        
        # If we don't have 3 different vibes, use what we have
        if len(top_vibes) < 3:
            # Fill with 'casual' if needed
            while len(top_vibes) < 3:
                top_vibes.append('casual')
        
        primary_vibe = top_vibes[0]
        secondary_vibe = top_vibes[1] 
        tertiary_vibe = top_vibes[2]
        
        print(f"   🎯 Primary vibe: {primary_vibe} (50%)")
        print(f"   🎯 Secondary vibe: {secondary_vibe} (30%)")
        print(f"   🎯 Tertiary vibe: {tertiary_vibe} (20%)")
        
        wardrobe_items = []
        remaining_df = style_df.copy()
        
        # Calculate target counts for each vibe (applied to entire wardrobe)
        primary_count = int(max_wardrobe_items * vibe_distribution['primary'])
        secondary_count = int(max_wardrobe_items * vibe_distribution['secondary'])
        tertiary_count = max_wardrobe_items - primary_count - secondary_count  # Remaining goes to tertiary
        
        print(f"   📊 Target vibe distribution: {primary_vibe} ({primary_count}), {secondary_vibe} ({secondary_count}), {tertiary_vibe} ({tertiary_count})")
        
        # Step 1: Select items by vibe first, ensuring category balance
        vibe_selections = {
            primary_vibe: [],
            secondary_vibe: [],
            tertiary_vibe: []
        }
        
        # Track category counts to ensure balance
        category_counts = {cat: 0 for cat in required_categories.keys()}
        
        # Select items by vibe, ensuring category balance
        for vibe, target_count in [(primary_vibe, primary_count), (secondary_vibe, secondary_count), (tertiary_vibe, tertiary_count)]:
            if target_count > 0:
                vibe_items = remaining_df[remaining_df['primary_vibe'] == vibe]
                selected_count = 0
                
                for idx, item in vibe_items.iterrows():
                    if selected_count >= target_count:
                        break
                    
                    category = item['category']
                    # Check if we need more items in this category
                    if category in required_categories and category_counts[category] < required_categories[category]:
                        vibe_selections[vibe].append(idx)
                        category_counts[category] += 1
                        selected_count += 1
                    elif all(category_counts[cat] >= required_categories[cat] for cat in required_categories.keys()):
                        # All required categories are filled, add any item
                        vibe_selections[vibe].append(idx)
                        selected_count += 1
                
                print(f"   🎨 Selected {len(vibe_selections[vibe])} {vibe} items")
        
        # Step 2: Combine selections and ensure we have enough items
        for vibe, items in vibe_selections.items():
            wardrobe_items.extend(items)
            remaining_df = remaining_df.drop(items)
        
        # Step 3: Fill any remaining slots to reach max_wardrobe_items
        if len(wardrobe_items) < max_wardrobe_items:
            needed = max_wardrobe_items - len(wardrobe_items)
            if len(remaining_df) > 0:
                selected = remaining_df.head(needed)
                wardrobe_items.extend(selected.index.tolist())
                remaining_df = remaining_df.drop(selected.index)
                print(f"   📦 Selected {len(selected)} additional items to reach {max_wardrobe_items}")
        
        # Step 4: Ensure we have minimum required categories
        final_wardrobe_df = style_df.loc[wardrobe_items]
        final_category_counts = final_wardrobe_df['category'].value_counts()
        
        for category, min_count in required_categories.items():
            if final_category_counts.get(category, 0) < min_count:
                print(f"   ⚠️  Warning: Only {final_category_counts.get(category, 0)} {category} items (need {min_count})")
        
        # Step 5: Create final datasets
        wardrobe_df = style_df.loc[wardrobe_items].copy()
        wardrobe_df['source'] = 'wardrobe'
        
        catalog_df = remaining_df.copy()
        catalog_df['source'] = 'catalog'
        
        # Print wardrobe summary with vibe breakdown
        print(f"\n📊 Wardrobe Summary ({len(wardrobe_df)} items):")
        category_counts = wardrobe_df['category'].value_counts()
        for category, count in category_counts.items():
            print(f"   {category}: {count} items")
        
        print(f"\n🎨 Vibe Distribution:")
        wardrobe_vibe_counts = wardrobe_df['primary_vibe'].value_counts()
        for vibe, count in wardrobe_vibe_counts.items():
            percentage = (count / len(wardrobe_df)) * 100
            print(f"   {vibe}: {count} items ({percentage:.1f}%)")
        
        return wardrobe_df, catalog_df
    
    def generate_embeddings(self, wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame) -> EmbeddingIndex:
        """Generate embeddings and save in the specified format"""
        print("🧠 Generating embeddings...")
        
        # Create embeddings directory
        embeddings_dir = os.path.join(self.processed_dir, 'embeddings')
        os.makedirs(embeddings_dir, exist_ok=True)
        
        # Initialize embedding index
        embedding_index = EmbeddingIndex(embeddings_dir=embeddings_dir)
        
        # Generate embeddings
        embedding_index.build_or_load(
            wardrobe_df=wardrobe_df,
            catalog_df=catalog_df,
            image_base_dir=self.raw_dir,
            show_progress=True
        )
        
        # Save embeddings in the specified format
        self._save_embeddings_format(embedding_index, wardrobe_df, catalog_df)
        
        print("✅ Embeddings generated successfully")
        return embedding_index
    
    def _save_embeddings_format(self, embedding_index: EmbeddingIndex, wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame):
        """Save embeddings in the specified .npy and index format"""
        # Combine all items
        all_items = pd.concat([wardrobe_df, catalog_df], ignore_index=True)
        
        # Get embeddings for all items
        embeddings = []
        emb_index_mapping = {}
        
        for idx, item in all_items.iterrows():
            item_id = item['id']
            try:
                # Get embedding for this item using the correct method
                emb = self._get_item_embedding(embedding_index, item_id)
                if emb is not None:
                    embeddings.append(emb)
                    emb_index_mapping[item_id] = len(embeddings) - 1
                else:
                    # Create zero embedding if not found
                    embeddings.append(np.zeros(512, dtype=np.float32))
                    emb_index_mapping[item_id] = len(embeddings) - 1
            except Exception as e:
                print(f"Warning: Could not get embedding for {item_id}: {e}")
                embeddings.append(np.zeros(512, dtype=np.float32))
                emb_index_mapping[item_id] = len(embeddings) - 1
        
        # Convert to numpy array and L2 normalize
        embeddings_array = np.array(embeddings, dtype=np.float32)
        norms = np.linalg.norm(embeddings_array, axis=1, keepdims=True)
        norms[norms == 0] = 1.0  # Avoid division by zero
        embeddings_array = embeddings_array / norms
        
        # Save embeddings
        embeddings_path = os.path.join(self.processed_dir, 'embeddings.npy')
        np.save(embeddings_path, embeddings_array)
        
        # Save index mapping
        index_path = os.path.join(self.processed_dir, 'emb_index.json')
        with open(index_path, 'w') as f:
            json.dump(emb_index_mapping, f, indent=2)
        
        print(f"💾 Saved embeddings to {embeddings_path}")
        print(f"💾 Saved index mapping to {index_path}")
    
    def load_enhanced_datasets(self) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Load existing enhanced datasets"""
        wardrobe_path = os.path.join(self.processed_dir, 'enhanced_wardrobe.parquet')
        catalog_path = os.path.join(self.processed_dir, 'enhanced_catalog.parquet')
        
        if not os.path.exists(wardrobe_path) or not os.path.exists(catalog_path):
            print("❌ Enhanced datasets not found! Please run create_enhanced_datasets first.")
            return pd.DataFrame(), pd.DataFrame()
        
        wardrobe_df = pd.read_parquet(wardrobe_path)
        catalog_df = pd.read_parquet(catalog_path)
        
        print(f"✅ Loaded datasets: Wardrobe ({len(wardrobe_df)} items), Catalog ({len(catalog_df)} items)")
        return wardrobe_df, catalog_df
    
    def _get_item_embedding(self, embedding_index, item_id: str) -> Optional[np.ndarray]:
        """Get embedding for a specific item"""
        try:
            # Check if it's a wardrobe item
            if hasattr(embedding_index, '_wardrobe_emb') and embedding_index._wardrobe_emb is not None:
                wardrobe_ids = embedding_index._wardrobe_ids
                if wardrobe_ids is not None:
                    for idx, wid in enumerate(wardrobe_ids):
                        if str(wid) == str(item_id):
                            return embedding_index._wardrobe_emb[idx]

            # Check if it's a catalog item
            if hasattr(embedding_index, '_catalog_emb') and embedding_index._catalog_emb is not None:
                catalog_ids = embedding_index._catalog_ids
                if catalog_ids is not None:
                    for idx, cid in enumerate(catalog_ids):
                        if str(cid) == str(item_id):
                            return embedding_index._catalog_emb[idx]

            return None
        except Exception as e:
            print(f"Warning: Could not get embedding for {item_id}: {e}")
            return None

    def add_new_item(self, image_path: str, item_name: Optional[str] = None) -> Dict:
        """Add a new item to the dataset"""
        print(f"📤 Adding new item: {image_path}")
        
        # Classify the new item
        classification = self.classifier.classify_image(image_path)
        classification['filename'] = image_path
        
        # Create style row
        style_df = pd.read_csv(os.path.join(self.processed_dir, 'style.csv'))
        new_row = self._create_style_row(classification, len(style_df))
        
        # Add to style dataset
        style_df = pd.concat([style_df, pd.DataFrame([new_row])], ignore_index=True)
        style_df.to_csv(os.path.join(self.processed_dir, 'style.csv'), index=False)
        
        # Add to wardrobe
        wardrobe_path = os.path.join(self.processed_dir, 'enhanced_wardrobe.parquet')
        if os.path.exists(wardrobe_path):
            wardrobe_df = pd.read_parquet(wardrobe_path)
            new_row['source'] = 'wardrobe'
            wardrobe_df = pd.concat([wardrobe_df, pd.DataFrame([new_row])], ignore_index=True)
            wardrobe_df.to_parquet(wardrobe_path, index=False)
        
        print(f"✅ Added new item: {new_row['id']} - {new_row['category']} - {new_row['subcategory']}")
        return new_row
    
    def get_dataset_summary(self, wardrobe_df: pd.DataFrame, catalog_df: pd.DataFrame) -> str:
        """Get a summary of the datasets"""
        summary = f"Dataset Summary:\n"
        summary += f"  Wardrobe: {len(wardrobe_df)} items\n"
        summary += f"  Catalog: {len(catalog_df)} items\n"
        summary += f"  Total: {len(wardrobe_df) + len(catalog_df)} items\n\n"
        
        # Category breakdown
        all_items = pd.concat([wardrobe_df, catalog_df], ignore_index=True)
        category_counts = all_items['category'].value_counts()
        
        summary += "Category Breakdown:\n"
        for category, count in category_counts.items():
            summary += f"  {category}: {count} items\n"
        
        return summary
