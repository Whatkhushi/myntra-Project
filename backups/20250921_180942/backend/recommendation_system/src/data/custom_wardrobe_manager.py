import os
import json
import pandas as pd
import numpy as np
from PIL import Image
from typing import List, Dict, Tuple
from datetime import datetime
import re

class CustomWardrobeManager:
    def __init__(self, organized_dir: str, processed_dir: str):
        self.organized_dir = organized_dir
        self.processed_dir = processed_dir
        os.makedirs(self.processed_dir, exist_ok=True)

    def extract_custom_wardrobe_classifications(self) -> pd.DataFrame:
        """Extract classifications for the specific items the user wants in their wardrobe"""
        print("📁 Extracting custom wardrobe classifications...")
        
        # Define the specific items the user wants in their wardrobe
        # Note: Some filenames contain special Unicode characters (\u202f) instead of regular spaces
        custom_wardrobe_items = {
            # Cocktail Dresses
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.07.22\u202fPM.png",
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.08.20\u202fPM.png",
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.18.25\u202fPM.png",
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.13.49\u202fPM.png",
            
            # Camisole
            "Top/Camisole/Screenshot 2025-09-20 at 12.51.28\u202fPM.png",
            
            # T-shirt
            "Top/T Shirt/Screenshot 2025-09-20 at 12.35.24\u202fPM.png",
            
            # Skirt
            "Bottom/Skirt/image copy 2.png",
            
            # Jeans
            "Bottom/Jeans/Screenshot 2025-09-20 at 12.56.36\u202fPM.png",
            "Bottom/Jeans/Screenshot 2025-09-20 at 12.56.48\u202fPM.png",
            
            # Tote
            "Bag/Tote/Screenshot 2025-09-20 at 1.40.34\u202fPM.png",
            
            # Bucket Bag
            "Bag/Bucket Bag/Screenshot 2025-09-20 at 1.42.33\u202fPM.png",
            
            # Belt
            "Accessories/Belts/Screenshot 2025-09-20 at 1.46.50\u202fPM.png",
            
            # Bracelet
            "Accessories/Bracelets/Screenshot 2025-09-20 at 1.35.26\u202fPM.png"
        }
        
        data = []
        item_id_counter = 0

        for item_path in custom_wardrobe_items:
            full_path = os.path.join(self.organized_dir, item_path)
            if not os.path.exists(full_path):
                print(f"⚠️  Warning: Item not found: {item_path}")
                continue
                
            # Extract category and subcategory from path
            path_parts = item_path.split('/')
            category = path_parts[0].replace(' ', '_').lower()
            subcategory = path_parts[1].replace(' ', '_').lower()
            filename = path_parts[2]
            
            # Basic image properties
            try:
                with Image.open(full_path) as img:
                    width, height = img.size
            except Exception:
                width, height = 0, 0

            # Generate attributes based on category/subcategory
            neckline = "unknown"
            sleeve_length = "unknown"
            length_type = "unknown"
            fit = "unknown"
            silhouette = "unknown"
            fabric_type = "unknown"
            pattern = "solid"
            pattern_scale = "medium"
            style_tags = ["casual"]
            formality = "casual"
            season = "all_season"
            tradition = "western"
            gender_target = "women"
            dominant_color_hex = "#ffffff"
            dominant_color_name = "white"
            dominant_color_h = 0
            dominant_color_s = 0
            dominant_color_v = 100
            secondary_colors = "[]"
            colorfulness_score = 0.0
            brightness_score = 1.0
            bbox_garment = ""
            created_at = datetime.now().isoformat()

            # Set attributes based on category/subcategory
            if category == 'dress':
                if 'cocktail' in subcategory:
                    style_tags = ["party", "elegant"]
                    formality = "formal"
                    length_type = "mini"
                    neckline = "sweetheart"
                    sleeve_length = "sleeveless"
                    silhouette = "bodycon"
                elif 'maxi' in subcategory:
                    length_type = "maxi"
                    style_tags = ["elegant", "bohemian"]
                elif 'midi' in subcategory:
                    length_type = "midi"
                    style_tags = ["elegant"]
                elif 'mini' in subcategory:
                    length_type = "mini"
                    style_tags = ["casual", "girly"]
            elif category == 'top':
                if 'camisole' in subcategory:
                    style_tags = ["casual", "girly"]
                    neckline = "sweetheart"
                    sleeve_length = "sleeveless"
                elif 't_shirt' in subcategory or 'tshirt' in subcategory:
                    style_tags = ["casual", "streetwear"]
                    neckline = "crew"
                    sleeve_length = "short"
                elif 'blouse' in subcategory:
                    style_tags = ["elegant"]
                    neckline = "v_neck"
                    sleeve_length = "long"
            elif category == 'bottom':
                if 'jeans' in subcategory:
                    style_tags = ["casual", "denim"]
                    fit = "relaxed"
                elif 'skirt' in subcategory:
                    style_tags = ["girly", "elegant"]
                    length_type = "mini"
                    silhouette = "a_line"
            elif category == 'bag':
                if 'tote' in subcategory:
                    style_tags = ["casual", "practical"]
                elif 'bucket' in subcategory:
                    style_tags = ["casual", "trendy"]
            elif category == 'accessories':
                if 'belts' in subcategory:
                    style_tags = ["edgy", "classic"]
                elif 'bracelets' in subcategory:
                    style_tags = ["girly", "elegant"]

            # Generate a unique item ID
            item_id = f"custom_{item_id_counter:03d}"
            item_id_counter += 1

            data.append({
                'id': item_id,
                'filename': full_path,
                'source': 'custom_wardrobe',
                'category': category,
                'category_conf': 1.0,
                'subcategory': subcategory,
                'subcategory_conf': 1.0,
                'neckline': neckline,
                'neckline_conf': 1.0,
                'sleeve_length': sleeve_length,
                'sleeve_length_conf': 1.0,
                'length_type': length_type,
                'length_conf': 1.0,
                'fit': fit,
                'fit_conf': 1.0,
                'silhouette': silhouette,
                'silhouette_conf': 1.0,
                'fabric_type': fabric_type,
                'fabric_conf': 1.0,
                'pattern': pattern,
                'pattern_confidence': 1.0,
                'pattern_scale': pattern_scale,
                'style_tags': json.dumps(style_tags),
                'style_confidence': json.dumps([1.0] * len(style_tags)),
                'formality': formality,
                'formality_conf': 1.0,
                'season': season,
                'season_conf': 1.0,
                'tradition': tradition,
                'tradition_conf': 1.0,
                'gender_target': gender_target,
                'gender_conf': 1.0,
                'dominant_color_hex': dominant_color_hex,
                'dominant_color_name': dominant_color_name,
                'dominant_color_h': dominant_color_h,
                'dominant_color_s': dominant_color_s,
                'dominant_color_v': dominant_color_v,
                'secondary_colors': secondary_colors,
                'colorfulness_score': colorfulness_score,
                'brightness_score': brightness_score,
                'emb_index': -1,
                'width_px': width,
                'height_px': height,
                'bbox_garment': bbox_garment,
                'created_at': created_at
            })

        print(f"✅ Extracted {len(data)} custom wardrobe items")
        return pd.DataFrame(data)

    def create_style_csv(self, df: pd.DataFrame):
        """Save the DataFrame to style.csv"""
        csv_path = os.path.join(self.processed_dir, 'style.csv')
        df.to_csv(csv_path, index=False)
        print(f"✅ Created style.csv with {len(df)} items")

    def create_custom_datasets(self, style_df: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """Create datasets with custom wardrobe as the user's wardrobe"""
        print("📊 Creating custom datasets...")
        
        # All items in style_df are the custom wardrobe items
        wardrobe_df = style_df.copy()
        wardrobe_df['source'] = 'wardrobe'
        
        # For catalog, we'll use a subset of other items from the organized folder
        # This ensures we have items to recommend from
        catalog_df = self._create_catalog_from_remaining_items()
        
        # Save datasets
        wardrobe_path = os.path.join(self.processed_dir, 'enhanced_wardrobe.parquet')
        catalog_path = os.path.join(self.processed_dir, 'enhanced_catalog.parquet')
        
        wardrobe_df.to_parquet(wardrobe_path, index=False)
        catalog_df.to_parquet(catalog_path, index=False)
        
        print(f"✅ Created custom datasets: Wardrobe ({len(wardrobe_df)} items), Catalog ({len(catalog_df)} items)")
        
        return wardrobe_df, catalog_df

    def _create_catalog_from_remaining_items(self) -> pd.DataFrame:
        """Create a catalog from other items in the organized folder"""
        print("📚 Creating catalog from remaining items...")
        
        # Get all items from organized folder
        all_items = []
        item_id_counter = 1000  # Start from 1000 to avoid conflicts with custom items
        
        for category_dir in os.listdir(self.organized_dir):
            category_path = os.path.join(self.organized_dir, category_dir)
            if not os.path.isdir(category_path):
                continue

            for subcategory_dir in os.listdir(category_path):
                subcategory_path = os.path.join(category_path, subcategory_dir)
                if not os.path.isdir(subcategory_path):
                    continue

                for filename in os.listdir(subcategory_path):
                    if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                        image_path = os.path.join(subcategory_path, filename)
                        
                        # Skip if this is one of our custom wardrobe items
                        relative_path = os.path.relpath(image_path, self.organized_dir)
                        if relative_path in self._get_custom_wardrobe_paths():
                            continue
                        
                        # Extract info from folder structure
                        category = category_dir.replace(' ', '_').lower()
                        subcategory = subcategory_dir.replace(' ', '_').lower()

                        # Basic image properties
                        try:
                            with Image.open(image_path) as img:
                                width, height = img.size
                        except Exception:
                            width, height = 0, 0

                        # Generate attributes (simplified for catalog items)
                        style_tags = ["casual"]
                        formality = "casual"
                        tradition = "western"
                        gender_target = "women"

                        # Generate a unique item ID
                        item_id = f"catalog_{item_id_counter:03d}"
                        item_id_counter += 1

                        all_items.append({
                            'id': item_id,
                            'filename': image_path,
                            'source': 'catalog',
                            'category': category,
                            'category_conf': 1.0,
                            'subcategory': subcategory,
                            'subcategory_conf': 1.0,
                            'neckline': "unknown",
                            'neckline_conf': 1.0,
                            'sleeve_length': "unknown",
                            'sleeve_length_conf': 1.0,
                            'length_type': "unknown",
                            'length_conf': 1.0,
                            'fit': "unknown",
                            'fit_conf': 1.0,
                            'silhouette': "unknown",
                            'silhouette_conf': 1.0,
                            'fabric_type': "unknown",
                            'fabric_conf': 1.0,
                            'pattern': "solid",
                            'pattern_confidence': 1.0,
                            'pattern_scale': "medium",
                            'style_tags': json.dumps(style_tags),
                            'style_confidence': json.dumps([1.0] * len(style_tags)),
                            'formality': formality,
                            'formality_conf': 1.0,
                            'season': "all_season",
                            'season_conf': 1.0,
                            'tradition': tradition,
                            'tradition_conf': 1.0,
                            'gender_target': gender_target,
                            'gender_conf': 1.0,
                            'dominant_color_hex': "#ffffff",
                            'dominant_color_name': "white",
                            'dominant_color_h': 0,
                            'dominant_color_s': 0,
                            'dominant_color_v': 100,
                            'secondary_colors': "[]",
                            'colorfulness_score': 0.0,
                            'brightness_score': 1.0,
                            'emb_index': -1,
                            'width_px': width,
                            'height_px': height,
                            'bbox_garment': "",
                            'created_at': datetime.now().isoformat()
                        })

        print(f"✅ Created catalog with {len(all_items)} items")
        return pd.DataFrame(all_items)

    def _get_custom_wardrobe_paths(self) -> set:
        """Get the relative paths of custom wardrobe items"""
        return {
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.07.22\u202fPM.png",
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.08.20\u202fPM.png",
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.18.25\u202fPM.png",
            "Dress/Cocktail Dress/Screenshot 2025-09-20 at 1.13.49\u202fPM.png",
            "Top/Camisole/Screenshot 2025-09-20 at 12.51.28\u202fPM.png",
            "Top/T Shirt/Screenshot 2025-09-20 at 12.35.24\u202fPM.png",
            "Bottom/Skirt/image copy 2.png",
            "Bottom/Jeans/Screenshot 2025-09-20 at 12.56.36\u202fPM.png",
            "Bottom/Jeans/Screenshot 2025-09-20 at 12.56.48\u202fPM.png",
            "Bag/Tote/Screenshot 2025-09-20 at 1.40.34\u202fPM.png",
            "Bag/Bucket Bag/Screenshot 2025-09-20 at 1.42.33\u202fPM.png",
            "Accessories/Belts/Screenshot 2025-09-20 at 1.46.50\u202fPM.png",
            "Accessories/Bracelets/Screenshot 2025-09-20 at 1.35.26\u202fPM.png"
        }
