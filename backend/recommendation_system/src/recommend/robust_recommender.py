from __future__ import annotations

import os
import json
import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Set
from itertools import combinations, product
import random
from datetime import datetime

from src.data.robust_data_manager import EmbeddingIndex
from src.utils.enhanced_image_utils import create_high_res_collage


@dataclass
class RobustOutfitRecommender:
    wardrobe_df: pd.DataFrame
    catalog_df: pd.DataFrame
    embedding_index: EmbeddingIndex
    image_base_dir: str
    output_dir: str
    
    def __post_init__(self):
        os.makedirs(self.output_dir, exist_ok=True)
        self.timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        self.outfit_dir = os.path.join(self.output_dir, self.timestamp)
        os.makedirs(self.outfit_dir, exist_ok=True)
        
        # Define outfit composition rules
        self.FULL_OUTFIT_CATEGORIES = {
            'dress': ['shoes', 'accessories', 'bag'],
            'lehenga_set': ['shoes', 'accessories', 'bag'],
            'saree': ['shoes', 'accessories', 'bag'],
            'top_bottom': ['top', 'bottom', 'shoes', 'accessories', 'bag']
        }
        
        # Category compatibility rules
        self.CATEGORY_COMPATIBILITY = {
            'top': ['bottom', 'shoes', 'accessories', 'bag', 'outerwear'],
            'bottom': ['top', 'shoes', 'accessories', 'bag', 'outerwear'],
            'dress': ['shoes', 'accessories', 'bag', 'outerwear'],
            'lehenga_set': ['shoes', 'accessories', 'bag'],
            'saree': ['shoes', 'accessories', 'bag'],
            'shoes': ['top', 'bottom', 'dress', 'lehenga_set', 'saree', 'accessories', 'bag'],
            'accessories': ['top', 'bottom', 'dress', 'lehenga_set', 'saree', 'shoes', 'bag'],
            'bag': ['top', 'bottom', 'dress', 'lehenga_set', 'saree', 'shoes', 'accessories'],
            'outerwear': ['top', 'bottom', 'dress']
        }
        
        # Invalid combinations
        self.INVALID_COMBINATIONS = [
            ('top', 'top'),  # No two tops unless one is outerwear
            ('dress', 'top'),  # No top over dress
            ('dress', 'bottom'),  # No bottom with dress
            ('lehenga_set', 'top'),  # No top with lehenga
            ('lehenga_set', 'bottom'),  # No bottom with lehenga
            ('saree', 'top'),  # No top with saree
            ('saree', 'bottom'),  # No bottom with saree
        ]
    
    def _get_compatibility_score(self, item1: Dict, item2: Dict) -> float:
        """Calculate compatibility score between two items"""
        score = 0.0
        
        # Category compatibility
        cat1, cat2 = item1.get('category', ''), item2.get('category', '')
        if cat2 in self.CATEGORY_COMPATIBILITY.get(cat1, []):
            score += 0.20
        
        # Style overlap
        styles1 = set(item1.get('style_tags', []))
        styles2 = set(item2.get('style_tags', []))
        style_overlap = len(styles1.intersection(styles2))
        score += min(style_overlap * 0.12, 0.36)
        
        # Pattern rules
        pattern1 = item1.get('pattern', 'solid')
        pattern2 = item2.get('pattern', 'solid')
        pattern_conf1 = item1.get('pattern_confidence', 0)
        pattern_conf2 = item2.get('pattern_confidence', 0)
        
        if pattern1 != 'solid' and pattern2 != 'solid' and pattern_conf1 > 0.35 and pattern_conf2 > 0.35:
            score -= 0.20  # Pattern clash
        elif (pattern1 == 'solid' and pattern2 != 'solid') or (pattern1 != 'solid' and pattern2 == 'solid'):
            score += 0.05  # Good contrast
        
        # Color harmony
        color1 = item1.get('primary_color', 'unknown')
        color2 = item2.get('primary_color', 'unknown')
        score += self._calculate_color_harmony(color1, color2)
        
        # Formality match
        occasion1 = item1.get('occasion', 'casual')
        occasion2 = item2.get('occasion', 'casual')
        if occasion1 == occasion2:
            score += 0.12
        elif self._is_formality_mismatch(occasion1, occasion2):
            score -= 0.18
        
        # Tradition match
        tradition1 = item1.get('tradition', 'western')
        tradition2 = item2.get('tradition', 'western')
        if tradition1 == tradition2:
            score += 0.10
        elif tradition1 != tradition2 and tradition1 != 'fusion' and tradition2 != 'fusion':
            score -= 0.35  # Ethnic vs Western mismatch
        
        # Proportion balance
        fit1 = item1.get('additional_details', {}).get('fit', 'regular')
        fit2 = item2.get('additional_details', {}).get('fit', 'regular')
        if (fit1 == 'fitted' and fit2 == 'loose') or (fit1 == 'loose' and fit2 == 'fitted'):
            score += 0.08
        elif fit1 == 'loose' and fit2 == 'loose':
            score -= 0.12
        
        # Novelty bonus
        if self._adds_novelty(item1, item2):
            score += 0.05
        
        return max(-1.0, min(1.0, score))  # Normalize to [-1, 1]
    
    def _calculate_color_harmony(self, color1: str, color2: str) -> float:
        """Calculate color harmony score"""
        # Color harmony rules
        complementary_pairs = [
            ('red', 'green'), ('blue', 'orange'), ('yellow', 'purple'),
            ('pink', 'mint'), ('navy', 'coral'), ('maroon', 'teal')
        ]
        
        analogous_colors = {
            'red': ['pink', 'maroon', 'coral'],
            'blue': ['navy', 'teal', 'mint'],
            'green': ['mint', 'teal'],
            'yellow': ['orange', 'coral'],
            'purple': ['lavender', 'maroon'],
            'brown': ['beige', 'cream', 'tan'],
            'black': ['grey', 'navy'],
            'white': ['cream', 'beige']
        }
        
        color1_lower = color1.lower()
        color2_lower = color2.lower()
        
        # Check for complementary colors
        for pair in complementary_pairs:
            if (color1_lower in pair and color2_lower in pair) or (color2_lower in pair and color1_lower in pair):
                return 0.12
        
        # Check for analogous colors
        for base_color, analogous in analogous_colors.items():
            if (color1_lower == base_color and color2_lower in analogous) or \
               (color2_lower == base_color and color1_lower in analogous):
                return 0.06
        
        # Check for neutral colors
        neutrals = ['black', 'white', 'grey', 'gray', 'beige', 'cream', 'brown', 'navy']
        if color1_lower in neutrals or color2_lower in neutrals:
            return 0.06
        
        # Check for color clash (60-120 degree difference)
        if self._is_color_clash(color1_lower, color2_lower):
            return -0.05
        
        return 0.0
    
    def _is_color_clash(self, color1: str, color2: str) -> bool:
        """Check if two colors clash"""
        clash_pairs = [
            ('red', 'green'), ('blue', 'orange'), ('yellow', 'purple'),
            ('pink', 'green'), ('red', 'blue'), ('yellow', 'blue')
        ]
        
        for pair in clash_pairs:
            if (color1 in pair and color2 in pair) or (color2 in pair and color1 in pair):
                return True
        return False
    
    def _is_formality_mismatch(self, occasion1: str, occasion2: str) -> bool:
        """Check if two occasions are a formality mismatch"""
        formal_occasions = ['formal', 'wedding', 'work']
        casual_occasions = ['casual', 'beach', 'sports']
        
        return (occasion1 in formal_occasions and occasion2 in casual_occasions) or \
               (occasion1 in casual_occasions and occasion2 in formal_occasions)
    
    def _adds_novelty(self, item1: Dict, item2: Dict) -> bool:
        """Check if item2 adds novelty to item1"""
        # Simple novelty check - different patterns, colors, or styles
        pattern1 = item1.get('pattern', 'solid')
        pattern2 = item2.get('pattern', 'solid')
        color1 = item1.get('primary_color', 'unknown')
        color2 = item2.get('primary_color', 'unknown')
        
        return (pattern1 != pattern2) or (color1 != color2)
    
    def _get_item_embedding(self, item_id: str) -> Optional[np.ndarray]:
        """Get embedding for a specific item"""
        try:
            # Check if it's a wardrobe item
            if hasattr(self.embedding_index, '_wardrobe_emb') and self.embedding_index._wardrobe_emb is not None:
                wardrobe_ids = self.embedding_index._wardrobe_ids
                if wardrobe_ids is not None:
                    for idx, wid in enumerate(wardrobe_ids):
                        if str(wid) == str(item_id):
                            return self.embedding_index._wardrobe_emb[idx]
            
            # Check if it's a catalog item
            if hasattr(self.embedding_index, '_catalog_emb') and self.embedding_index._catalog_emb is not None:
                catalog_ids = self.embedding_index._catalog_ids
                if catalog_ids is not None:
                    for idx, cid in enumerate(catalog_ids):
                        if str(cid) == str(item_id):
                            return self.embedding_index._catalog_emb[idx]
            
            return None
        except Exception as e:
            print(f"Warning: Could not get embedding for {item_id}: {e}")
            return None
    
    def _is_valid_outfit_combination(self, items: List[Dict]) -> bool:
        """Check if a combination of items forms a valid outfit"""
        if not items:
            return False
        
        categories = [item.get('category', '') for item in items]
        
        # Check for invalid combinations (but allow two tops as seeds)
        for i, cat1 in enumerate(categories):
            for j, cat2 in enumerate(categories):
                if i != j and (cat1, cat2) in self.INVALID_COMBINATIONS:
                    # Special case: allow two tops if they are both seeds (first two items)
                    if (cat1, cat2) == ('top', 'top') and i < 2 and j < 2:
                        continue
                    return False
        
        # Check for duplicate items (same ID)
        item_ids = [item.get('id', '') for item in items]
        if len(item_ids) != len(set(item_ids)):
            return False
        
        # Check for two non-layer tops (only reject if we're trying to add another top)
        top_categories = [cat for cat in categories if cat == 'top']
        outerwear_categories = [cat for cat in categories if cat == 'outerwear']
        
        # Only reject if we have more than 2 tops (allowing 2 tops as seeds)
        if len(top_categories) > 2:
            return False
        
        # If we have exactly 2 tops, only allow outerwear as additional tops
        if len(top_categories) == 2:
            # Check if the last item added is a top (not outerwear)
            if categories[-1] == 'top' and 'outerwear' not in categories:
                return False
        return True
    
    def _get_candidate_items(self, category: str, exclude_ids: Set[str] = None) -> List[Dict]:
        """Get candidate items for a specific category"""
        if exclude_ids is None:
            exclude_ids = set()
        
        candidates = []
        
        # Add from wardrobe
        wardrobe_items = self.wardrobe_df[
            (self.wardrobe_df['category'] == category) & 
            (~self.wardrobe_df['id'].isin(exclude_ids))
        ].to_dict('records')
        candidates.extend(wardrobe_items)
        
        # Add from catalog
        catalog_items = self.catalog_df[
            (self.catalog_df['category'] == category) & 
            (~self.catalog_df['id'].isin(exclude_ids))
        ].to_dict('records')
        candidates.extend(catalog_items)
        
        return candidates
    
    def _calculate_outfit_score(self, outfit_items: List[Dict], seed_items: List[Dict]) -> float:
        """Calculate overall outfit score"""
        if not outfit_items:
            return 0.0
        
        # Cosine similarity score (average of all item similarities)
        cos_sim_scores = []
        for seed_item in seed_items:
            for outfit_item in outfit_items:
                if outfit_item['id'] != seed_item['id']:
                    # Get embeddings for both items
                    seed_emb = self._get_item_embedding(seed_item['id'])
                    outfit_emb = self._get_item_embedding(outfit_item['id'])
                    if seed_emb is not None and outfit_emb is not None:
                        sim = self.embedding_index.cosine_similarity(seed_emb, outfit_emb)
                        cos_sim_scores.append(sim)
        
        avg_cos_sim = np.mean(cos_sim_scores) if cos_sim_scores else 0.0
        
        # Rule-based score (average of all pairwise compatibilities)
        rule_scores = []
        for i, item1 in enumerate(outfit_items):
            for j, item2 in enumerate(outfit_items):
                if i != j:
                    rule_score = self._get_compatibility_score(item1, item2)
                    rule_scores.append(rule_score)
        
        avg_rule_score = np.mean(rule_scores) if rule_scores else 0.0
        
        # Combine scores: 60% cosine similarity, 40% rule-based
        final_score = 0.60 * avg_cos_sim + 0.40 * avg_rule_score
        
        return final_score
    
    def _ensure_complete_outfit(self, seed_items: List[Dict], complementary_items: List[Dict]) -> List[Dict]:
        """Ensure the outfit is complete and valid"""
        outfit_items = seed_items.copy()
        
        # Determine outfit type based on seed items
        seed_categories = [item.get('category', '') for item in seed_items]
        
        if any(cat in ['dress', 'lehenga_set', 'saree'] for cat in seed_categories):
            # Full outfit item - only need shoes, accessories, bag
            required_categories = ['shoes', 'accessories', 'bag']
        else:
            # Top + bottom combination - need all components
            # Check what we already have
            if 'top' in seed_categories:
                required_categories = ['bottom', 'shoes', 'accessories', 'bag']
            elif 'bottom' in seed_categories:
                required_categories = ['top', 'shoes', 'accessories', 'bag']
            else:
                required_categories = ['top', 'bottom', 'shoes', 'accessories', 'bag']
        
        # Add missing categories
        current_categories = [item.get('category', '') for item in outfit_items]
        
        for category in required_categories:
            if category not in current_categories:
                # Find best candidate for this category
                candidates = self._get_candidate_items(category, {item['id'] for item in outfit_items})
                
                if candidates:
                    # Score candidates based on compatibility with current outfit
                    best_candidate = None
                    best_score = -float('inf')
                    
                    for candidate in candidates:
                        # Check if adding this candidate would create invalid combination
                        test_outfit = outfit_items + [candidate]
                        is_valid = self._is_valid_outfit_combination(test_outfit)
                        if is_valid:
                            score = self._calculate_outfit_score(test_outfit, seed_items)
                            if score > best_score:
                                best_score = score
                                best_candidate = candidate
                    
                    if best_candidate:
                        outfit_items.append(best_candidate)
        return outfit_items
    
    def _generate_distinct_outfits(self, seed_items: List[Dict], num_outfits: int = 3) -> List[Dict]:
        """Generate distinct outfit recommendations"""
        if not seed_items:
            return []
        
        # Get all possible candidate items
        all_candidates = []
        
        # Add from wardrobe
        wardrobe_items = self.wardrobe_df.to_dict('records')
        all_candidates.extend(wardrobe_items)
        
        # Add from catalog
        catalog_items = self.catalog_df.to_dict('records')
        all_candidates.extend(catalog_items)
        
        # Remove seed items from candidates
        seed_ids = {item['id'] for item in seed_items}
        candidates = [item for item in all_candidates if item['id'] not in seed_ids]
        
        # Generate outfit combinations
        outfits = []
        max_attempts = 1000
        attempts = 0
        
        while len(outfits) < num_outfits and attempts < max_attempts:
            attempts += 1
            
            # Create a complete outfit
            outfit_items = self._ensure_complete_outfit(seed_items, candidates)
            
            if not outfit_items or len(outfit_items) < 2:
                continue
            
            # Check if outfit is valid
            if not self._is_valid_outfit_combination(outfit_items):
                continue
            
            # Calculate outfit score
            score = self._calculate_outfit_score(outfit_items, seed_items)
            
            # Check for distinctness
            outfit_ids = {item['id'] for item in outfit_items}
            is_distinct = True
            
            for existing_outfit in outfits:
                existing_ids = {item['id'] for item in existing_outfit['items']}
                jaccard_sim = len(outfit_ids.intersection(existing_ids)) / len(outfit_ids.union(existing_ids))
                if jaccard_sim > 0.85:  # Too similar
                    is_distinct = False
                    break
            
            if is_distinct:
                outfit = {
                    'items': outfit_items,
                    'score': score,
                    'description': self._generate_outfit_description(outfit_items),
                    'occasion': seed_items[0].get('occasion', 'casual'),
                    'image_path': None  # Will be set when generating collage
                }
                outfits.append(outfit)
        
        # Sort by score
        outfits.sort(key=lambda x: x['score'], reverse=True)
        
        return outfits[:num_outfits]
    
    def _generate_outfit_description(self, items: List[Dict]) -> str:
        """Generate a description for the outfit"""
        if not items:
            return "Empty outfit"
        
        descriptions = []
        for item in items:
            category = item.get('category', 'Unknown')
            subcategory = item.get('subcategory', 'Unknown')
            color = item.get('primary_color', 'Unknown')
            descriptions.append(f"{category} - {subcategory} ({color})")
        
        return " + ".join(descriptions)
    
    def _generate_outfit_collage(self, outfit: Dict, outfit_idx: int) -> str:
        """Generate high-resolution collage for outfit"""
        items = outfit['items']
        image_paths = []
        captions = []
        
        for item in items:
            # Get image path
            filename = item.get('filename', '')
            if not filename:
                continue
            
            # Check if file exists
            if os.path.exists(filename):
                image_paths.append(filename)
            else:
                # Try to find in image base directory
                basename = os.path.basename(filename)
                potential_path = os.path.join(self.image_base_dir, basename)
                if os.path.exists(potential_path):
                    image_paths.append(potential_path)
                    continue
                
                # Try to find in organized dataset
                for root, dirs, files in os.walk(self.image_base_dir):
                    if basename in files:
                        image_paths.append(os.path.join(root, basename))
                        break
            
            # Create caption
            category = item.get('category', 'Unknown')
            subcategory = item.get('subcategory', 'Unknown')
            color = item.get('primary_color', 'Unknown')
            item_id = item.get('id', 'Unknown')
            caption = f"{item_id} | {category} | {subcategory} | {color}"
            captions.append(caption)
        
        if not image_paths:
            return None
        
        # Generate collage
        output_path = os.path.join(self.outfit_dir, f"outfit_{outfit_idx + 1}.jpg")
        
        try:
            # Prepare item data for collage
            item_images = []
            for i, (item, path) in enumerate(zip(items, image_paths)):
                item_images.append({
                    'image_path': path,
                    'id': item.get('id', f'item_{i}'),
                    'category': item.get('category', 'unknown'),
                    'subcategory': item.get('subcategory', 'unknown'),
                    'color': item.get('dominant_color_name', 'unknown')
                })
            
            result_path = create_high_res_collage(
                item_images=item_images,
                output_path=output_path,
                width=1200,
                height=800,
                items_per_row=3
            )
            return result_path
        except Exception as e:
            print(f"Error generating collage for outfit {outfit_idx + 1}: {e}")
            return None
    
    def recommend_outfits(self, seed_item_ids: List[int], occasion: str = "casual", num_outfits: int = 3) -> List[Dict]:
        """Generate guaranteed outfit recommendations"""
        print(f"🎯 Generating guaranteed outfit recommendations...")
        print(f"   Seed items: {seed_item_ids}")
        print(f"   Occasion: {occasion}")
        print(f"   Number of outfits: {num_outfits}")
        
        # Find seed items
        seed_items = []
        for item_id in seed_item_ids:
            # Check in wardrobe
            wardrobe_item = self.wardrobe_df[self.wardrobe_df['id'] == item_id]
            if not wardrobe_item.empty:
                seed_items.append(wardrobe_item.iloc[0].to_dict())
                continue
            
            # Check in catalog
            catalog_item = self.catalog_df[self.catalog_df['id'] == item_id]
            if not catalog_item.empty:
                seed_items.append(catalog_item.iloc[0].to_dict())
                continue
        
        if not seed_items:
            print("❌ No seed items found!")
            return []
        
        print(f"✅ Found {len(seed_items)} seed items")
        
        # Generate distinct outfits
        outfits = self._generate_distinct_outfits(seed_items, num_outfits)
        
        if not outfits:
            print("❌ No valid outfits generated!")
            return []
        
        print(f"✅ Generated {len(outfits)} guaranteed outfit recommendations")
        
        # Generate collages for each outfit
        for i, outfit in enumerate(outfits):
            collage_path = self._generate_outfit_collage(outfit, i)
            outfit['image_path'] = collage_path
        
        # Save metadata
        self._save_outfit_metadata(outfits)
        
        return outfits
    
    def _save_outfit_metadata(self, outfits: List[Dict]):
        """Save outfit metadata to JSON"""
        metadata = {
            'timestamp': self.timestamp,
            'outfits': []
        }
        
        for i, outfit in enumerate(outfits):
            outfit_metadata = {
                'outfit_id': i + 1,
                'score': outfit['score'],
                'description': outfit['description'],
                'occasion': outfit['occasion'],
                'image_path': outfit['image_path'],
                'items': []
            }
            
            for item in outfit['items']:
                item_metadata = {
                    'id': item.get('id', ''),
                    'category': item.get('category', ''),
                    'subcategory': item.get('subcategory', ''),
                    'color': item.get('primary_color', ''),
                    'style': item.get('style_tags', []),
                    'filename': item.get('filename', '')
                }
                outfit_metadata['items'].append(item_metadata)
            
            metadata['outfits'].append(outfit_metadata)
        
        # Save metadata
        metadata_path = os.path.join(self.outfit_dir, 'metadata.json')
        with open(metadata_path, 'w') as f:
            json.dump(metadata, f, indent=2)
        
        print(f"💾 Saved outfit metadata to {metadata_path}")
    
    def get_recommendation_summary(self, outfits: List[Dict]) -> str:
        """Get a summary of recommendations"""
        if not outfits:
            return "No recommendations generated."
        
        summary = f"Generated {len(outfits)} outfit recommendations:\n"
        
        for i, outfit in enumerate(outfits, 1):
            summary += f"\nOutfit {i} (Score: {outfit['score']:.2f}):\n"
            summary += f"  {outfit['description']}\n"
            summary += f"  Occasion: {outfit['occasion']}\n"
            if outfit['image_path']:
                summary += f"  Image: {outfit['image_path']}\n"
        
        return summary
