from __future__ import annotations

import os
import json
# OpenCV import disabled due to compatibility issues
CV2_AVAILABLE = False
print("Warning: OpenCV disabled due to compatibility issues. Using PIL-only image analysis.")
import numpy as np
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
import re
from pathlib import Path

import pandas as pd
from PIL import Image
import torch
from transformers import CLIPModel, CLIPProcessor
from tqdm import tqdm

# Enhanced classification labels with more specific categories
CATEGORY_LABELS = [
    "women's top clothing", "women's bottom clothing", "women's dress", "lehenga set", "saree", "women's shoes", "women's bag", "fashion accessories", "women's outerwear"
]

SUBCATEGORY_LABELS = {
    "women's top clothing": [
        "women's t-shirt", "women's blouse", "women's crop top", "women's shirt", "women's tank top", "women's camisole", "women's jacket", 
        "women's sweater", "women's hoodie", "women's kurti", "women's tunic", "women's bodysuit", "women's cardigan", "women's blazer"
    ],
    "women's bottom clothing": [
        "women's jeans", "women's skirt", "women's pants", "women's shorts", "women's leggings", "women's culottes", "women's trousers",
        "women's capri", "women's joggers", "women's track pants", "women's palazzo"
    ],
    "women's dress": [
        "women's maxi dress", "women's midi dress", "women's mini dress", "women's western dress", 
        "women's cocktail dress", "women's evening dress", "women's party dress", "women's casual dress", "women's formal dress"
    ],
    "lehenga set": [
        "lehenga set", "lehenga choli", "lehenga skirt", "lehenga top"
    ],
    "saree": [
        "saree", "sari", "saree blouse", "saree petticoat"
    ],
    "women's shoes": [
        "women's sneakers", "women's flats", "women's heels", "women's boots", "women's sandals", "women's loafers", "women's pumps", 
        "women's wedges", "women's stilettos", "women's oxfords", "women's mules", "women's slides"
    ],
    "women's bag": [
        "women's tote bag", "women's sling bag", "women's backpack", "women's clutch", "women's handbag", "women's crossbody bag", "women's shoulder bag",
        "women's satchel", "women's hobo bag", "women's bucket bag", "women's messenger bag"
    ],
    "fashion accessories": [
        "women's earrings", "women's necklaces", "women's bracelets", "women's rings", "women's belts", "women's hair accessories",
        "women's watches", "women's scarves", "women's sunglasses", "women's hats", "women's gloves", "women's brooches"
    ],
    "women's outerwear": [
        "women's denim jacket", "women's leather jacket", "women's blazer", "women's cardigan", "women's coat", "women's vest"
    ]
}

PATTERN_LABELS = [
    "solid", "striped", "floral", "checked", "polka_dot", "abstract", "geometric",
    "animal_print", "paisley", "embroidered", "printed", "plaid", "houndstooth"
]

STYLE_LABELS = [
    "girly", "edgy", "grunge", "y2k", "boho", "chic", "minimalist", "glam", 
    "vintage", "elegant", "casual", "formal", "sporty", "romantic", "modern"
]

OCCASION_LABELS = [
    "casual wear", "formal wear", "semi-formal wear", "party wear", "wedding wear", "work wear", "beach wear", "sports wear"
]

COLOR_LABELS = [
    "white", "black", "grey", "gray", "beige", "brown", "navy", "blue", "green", 
    "red", "pink", "yellow", "purple", "orange", "cream", "maroon", "teal", 
    "burgundy", "gold", "silver", "bronze", "coral", "mint", "lavender"
]

FABRIC_LABELS = [
    "cotton", "silk", "denim", "leather", "wool", "linen", "polyester", "rayon",
    "chiffon", "georgette", "satin", "velvet", "lace", "mesh", "jersey", "crepe"
]

SEASON_LABELS = [
    "summer", "winter", "monsoon", "spring", "fall", "all_season"
]

NECKLINE_LABELS = [
    "round", "v_neck", "square", "halter", "off_shoulder", "boat", "sweetheart",
    "high_neck", "cowl", "asymmetric"
]

SLEEVE_LABELS = [
    "sleeveless", "short_sleeve", "long_sleeve", "three_quarter", "cap_sleeve",
    "bell_sleeve", "puff_sleeve", "raglan"
]

FIT_LABELS = [
    "fitted", "flared", "loose", "oversized", "regular", "skinny", "wide"
]

HEEL_LABELS = [
    "flat", "low_heel", "medium_heel", "high_heel", "stiletto", "wedge", "block_heel"
]

BAG_SIZE_LABELS = [
    "mini", "small", "medium", "large", "oversized"
]

TRADITION_LABELS = [
    "ethnic", "western", "fusion"
]

GENDER_LABELS = [
    "women", "men", "unisex"
]


@dataclass
class RobustClassifier:
    model_name: str = "openai/clip-vit-base-patch32"
    
    def __post_init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else ("mps" if torch.backends.mps.is_available() else "cpu"))
        self.model: CLIPModel = CLIPModel.from_pretrained(self.model_name).to(self.device).eval()
        self.processor: CLIPProcessor = CLIPProcessor.from_pretrained(self.model_name)
        
        # Precompute text embeddings for efficiency
        self._precompute_text_embeddings()
    
    def _precompute_text_embeddings(self):
        """Precompute text embeddings for all label sets"""
        print("🔄 Precomputing text embeddings...")
        
        self.text_embeddings = {}
        
        # Category embeddings
        self.text_embeddings['category'] = self._encode_texts(
            [f"a photo of a {label}" for label in CATEGORY_LABELS]
        )
        
        # Subcategory embeddings for each category
        for category, subcategories in SUBCATEGORY_LABELS.items():
            self.text_embeddings[f'subcategory_{category}'] = self._encode_texts(
                [f"a photo of a {label}" for label in subcategories]
            )
        
        # Other attribute embeddings
        self.text_embeddings['pattern'] = self._encode_texts(
            [f"a {label} pattern" for label in PATTERN_LABELS]
        )
        self.text_embeddings['style'] = self._encode_texts(
            [f"{label} style" for label in STYLE_LABELS]
        )
        self.text_embeddings['occasion'] = self._encode_texts(
            [f"{label} style outfit" for label in OCCASION_LABELS]
        )
        self.text_embeddings['color'] = self._encode_texts(
            [f"the color {label}" for label in COLOR_LABELS]
        )
        self.text_embeddings['fabric'] = self._encode_texts(
            [f"made of {label}" for label in FABRIC_LABELS]
        )
        self.text_embeddings['season'] = self._encode_texts(
            [f"{label} clothing" for label in SEASON_LABELS]
        )
        self.text_embeddings['tradition'] = self._encode_texts(
            [f"{label} fashion" for label in TRADITION_LABELS]
        )
        self.text_embeddings['gender'] = self._encode_texts(
            [f"{label} clothing" for label in GENDER_LABELS]
        )
        
        # Additional detail embeddings
        self.text_embeddings['neckline'] = self._encode_texts(
            [f"{label} neckline" for label in NECKLINE_LABELS]
        )
        self.text_embeddings['sleeve'] = self._encode_texts(
            [f"{label} sleeve" for label in SLEEVE_LABELS]
        )
        self.text_embeddings['fit'] = self._encode_texts(
            [f"{label} fit" for label in FIT_LABELS]
        )
        self.text_embeddings['heel'] = self._encode_texts(
            [f"{label} heel" for label in HEEL_LABELS]
        )
        self.text_embeddings['bag_size'] = self._encode_texts(
            [f"{label} bag" for label in BAG_SIZE_LABELS]
        )
        
        print("✅ Text embeddings precomputed")
    
    def _encode_image(self, image: Image.Image) -> np.ndarray:
        """Encode image to CLIP embedding"""
        inputs = self.processor(images=image, return_tensors="pt")
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            feats = self.model.get_image_features(**inputs)[0].detach().cpu().numpy().astype(np.float32)
        norm = np.linalg.norm(feats)
        if norm > 0:
            feats = feats / norm
        return feats
    
    def _encode_texts(self, prompts: List[str]) -> np.ndarray:
        """Encode text prompts to CLIP embeddings"""
        inputs = self.processor(text=prompts, return_tensors="pt", padding=True, truncation=True)
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        with torch.no_grad():
            feats = self.model.get_text_features(**inputs).detach().cpu().numpy().astype(np.float32)
        norms = np.linalg.norm(feats, axis=1, keepdims=True)
        norms[norms == 0] = 1.0
        feats = feats / norms
        return feats
    
    def _match_with_confidence(self, image_vec: np.ndarray, label_set: str) -> Tuple[str, float]:
        """Match image to best label with confidence score using precomputed embeddings"""
        text_embeddings = self.text_embeddings[label_set]
        similarities = text_embeddings @ image_vec
        best_idx = int(np.argmax(similarities))
        
        # Get the actual label based on the set
        if label_set == 'category':
            labels = CATEGORY_LABELS
        elif label_set.startswith('subcategory_'):
            category = label_set.split('_')[1]
            labels = SUBCATEGORY_LABELS.get(category, [])
        elif label_set == 'pattern':
            labels = PATTERN_LABELS
        elif label_set == 'style':
            labels = STYLE_LABELS
        elif label_set == 'occasion':
            labels = OCCASION_LABELS
        elif label_set == 'color':
            labels = COLOR_LABELS
        elif label_set == 'fabric':
            labels = FABRIC_LABELS
        elif label_set == 'season':
            labels = SEASON_LABELS
        elif label_set == 'tradition':
            labels = TRADITION_LABELS
        elif label_set == 'gender':
            labels = GENDER_LABELS
        elif label_set == 'neckline':
            labels = NECKLINE_LABELS
        elif label_set == 'sleeve':
            labels = SLEEVE_LABELS
        elif label_set == 'fit':
            labels = FIT_LABELS
        elif label_set == 'heel':
            labels = HEEL_LABELS
        elif label_set == 'bag_size':
            labels = BAG_SIZE_LABELS
        else:
            labels = []
        
        if not labels or best_idx >= len(labels):
            return "unknown", 0.0
        
        return labels[best_idx], float(similarities[best_idx])
    
    def _analyze_image_properties(self, image_path: str) -> Dict:
        """Analyze image properties for heuristics"""
        try:
            if CV2_AVAILABLE:
                # Load image with OpenCV for analysis
                img_cv = cv2.imread(image_path)
                if img_cv is None:
                    return {}
                
                height, width = img_cv.shape[:2]
                aspect_ratio = height / width
                
                # Convert to HSV for color analysis
                hsv = cv2.cvtColor(img_cv, cv2.COLOR_BGR2HSV)
                
                # Analyze color distribution
                hist_h = cv2.calcHist([hsv], [0], None, [180], [0, 180])
                hist_s = cv2.calcHist([hsv], [1], None, [256], [0, 256])
                hist_v = cv2.calcHist([hsv], [2], None, [256], [0, 256])
                
                # Find dominant hue
                dominant_hue = np.argmax(hist_h)
                saturation = np.mean(hist_s)
                brightness = np.mean(hist_v)
                
                # Analyze texture (simple edge detection)
                gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
                edges = cv2.Canny(gray, 50, 150)
                edge_density = np.sum(edges > 0) / (height * width)
                
                # Analyze vertical structure (for jeans vs camisole)
                vertical_projection = np.sum(edges, axis=1)
                vertical_continuity = np.std(vertical_projection)
                
                return {
                    'aspect_ratio': aspect_ratio,
                    'height': height,
                    'width': width,
                    'dominant_hue': dominant_hue,
                    'saturation': saturation,
                    'brightness': brightness,
                    'edge_density': edge_density,
                    'vertical_continuity': vertical_continuity,
                    'area': height * width
                }
            else:
                # Fallback to PIL-only analysis
                img = Image.open(image_path).convert("RGB")
                width, height = img.size
                aspect_ratio = height / width
                
                # Basic color analysis using PIL
                colors = img.getcolors(maxcolors=256*256*256)
                if colors:
                    most_frequent = max(colors, key=lambda x: x[0])
                    rgb = most_frequent[1]
                    # Convert RGB to HSV manually
                    r, g, b = rgb[0]/255.0, rgb[1]/255.0, rgb[2]/255.0
                    max_val = max(r, g, b)
                    min_val = min(r, g, b)
                    diff = max_val - min_val
                    
                    # Simple HSV calculation
                    if diff == 0:
                        h = 0
                    elif max_val == r:
                        h = (60 * ((g - b) / diff) + 360) % 360
                    elif max_val == g:
                        h = (60 * ((b - r) / diff) + 120) % 360
                    else:
                        h = (60 * ((r - g) / diff) + 240) % 360
                    
                    s = 0 if max_val == 0 else diff / max_val
                    v = max_val
                    
                    dominant_hue = int(h)
                    saturation = int(s * 100)
                    brightness = int(v * 100)
                else:
                    dominant_hue = 0
                    saturation = 0
                    brightness = 0
                
                # Basic edge detection using PIL (simplified)
                img_gray = img.convert('L')
                # Simple edge detection approximation
                edge_density = 0.1  # Default value
                vertical_continuity = 0.3  # Default value
                
                return {
                    'aspect_ratio': aspect_ratio,
                    'height': height,
                    'width': width,
                    'dominant_hue': dominant_hue,
                    'saturation': saturation,
                    'brightness': brightness,
                    'edge_density': edge_density,
                    'vertical_continuity': vertical_continuity,
                    'area': height * width
                }
        except Exception as e:
            print(f"Warning: Could not analyze image properties for {image_path}: {e}")
            return {}
    
    def _apply_heuristics(self, image_path: str, category: str, subcategory: str, 
                         cat_conf: float, sub_conf: float, image_props: Dict) -> Tuple[str, str, float, float]:
        """Apply heuristics to correct common classification errors"""
        
        # Heuristic 1: Jeans vs Camisole confusion
        if (subcategory in ['camisole', 'tank_top'] and 
            image_props.get('aspect_ratio', 0) >= 1.4 and
            image_props.get('vertical_continuity', 0) < 0.3):
            # Likely jeans - has vertical structure and high aspect ratio
            if 'jeans' in image_path.lower() or 'denim' in image_path.lower():
                return 'bottom', 'jeans', max(cat_conf, 0.4), max(sub_conf, 0.4)
        
        # Heuristic 2: Denim jacket vs jeans
        if (subcategory == 'jeans' and 
            image_props.get('aspect_ratio', 0) < 1.2 and
            'denim' in image_path.lower()):
            # Check for sleeve-like structures
            if image_props.get('edge_density', 0) > 0.1:  # High edge density might indicate sleeves
                return 'outerwear', 'denim_jacket', max(cat_conf, 0.4), max(sub_conf, 0.4)
        
        # Heuristic 3: Skirt vs Dress
        if (category == 'bottom' and subcategory == 'skirt' and
            image_props.get('aspect_ratio', 0) > 1.6 and
            image_props.get('vertical_continuity', 0) > 0.5):
            # Likely dress - continuous vertical structure
            return 'dress', 'midi_dress', max(cat_conf, 0.4), max(sub_conf, 0.4)
        
        # Heuristic 4: Tops vs Accessories (small items)
        if (category == 'top' and 
            image_props.get('area', 0) < (image_props.get('height', 1000) * image_props.get('width', 1000) * 0.12)):
            # Very small area - likely accessory
            return 'accessories', 'necklaces', max(cat_conf, 0.3), max(sub_conf, 0.3)
        
        # Heuristic 5: Full-length dress vs midi dress
        if (subcategory == 'midi_dress' and 
            image_props.get('aspect_ratio', 0) > 2.0):
            # Very tall aspect ratio - likely maxi dress
            return 'dress', 'maxi_dress', max(cat_conf, 0.4), max(sub_conf, 0.4)
        
        # Heuristic 6: Lehenga/Saree detection (heavy embroidery, traditional patterns)
        if (image_props.get('edge_density', 0) > 0.15 and  # High detail
            image_props.get('saturation', 0) > 100):  # High saturation (traditional colors)
            if category in ['top', 'dress'] and 'ethnic' in image_path.lower():
                if 'lehenga' in image_path.lower():
                    return 'lehenga_set', 'lehenga_set', max(cat_conf, 0.5), max(sub_conf, 0.5)
                elif 'saree' in image_path.lower():
                    return 'saree', 'saree', max(cat_conf, 0.5), max(sub_conf, 0.5)
        
        # Return original classification if no heuristics apply
        return category, subcategory, cat_conf, sub_conf
    
    def _normalize_classification(self, category: str, subcategory: str) -> Tuple[str, str]:
        """Normalize classification results to canonical values"""
        # Category normalization
        category_map = {
            'women\'s top clothing': 'top',
            'women\'s bottom clothing': 'bottom', 
            'women\'s dress': 'dress',
            'lehenga set': 'lehenga_set',
            'women\'s shoes': 'shoes',
            'women\'s bag': 'bag',
            'fashion accessories': 'accessories',
            'women\'s outerwear': 'outerwear',
            'full-length dress': 'dress',
            'kurta': 'kurti',
            'lehenga choli': 'lehenga_set',
            'sari': 'saree'
        }
        category = category_map.get(category.lower(), category.lower())
        
        # Subcategory normalization
        subcategory_map = {
            # New women's specific mappings
            'women\'s t-shirt': 't_shirt',
            'women\'s blouse': 'blouse',
            'women\'s crop top': 'crop_top',
            'women\'s shirt': 'shirt',
            'women\'s tank top': 'tank_top',
            'women\'s camisole': 'camisole',
            'women\'s jacket': 'jacket',
            'women\'s sweater': 'sweater',
            'women\'s hoodie': 'hoodie',
            'women\'s kurti': 'kurti',
            'women\'s tunic': 'tunic',
            'women\'s bodysuit': 'bodysuit',
            'women\'s cardigan': 'cardigan',
            'women\'s blazer': 'blazer',
            'women\'s jeans': 'jeans',
            'women\'s skirt': 'skirt',
            'women\'s pants': 'pants',
            'women\'s shorts': 'shorts',
            'women\'s leggings': 'leggings',
            'women\'s culottes': 'culottes',
            'women\'s trousers': 'trousers',
            'women\'s capri': 'capri',
            'women\'s joggers': 'joggers',
            'women\'s track pants': 'track_pants',
            'women\'s palazzo': 'palazzo',
            'women\'s maxi dress': 'maxi_dress',
            'women\'s midi dress': 'midi_dress',
            'women\'s mini dress': 'mini_dress',
            'women\'s western dress': 'western_dress',
            'women\'s cocktail dress': 'cocktail_dress',
            'women\'s evening dress': 'evening_dress',
            'women\'s party dress': 'party_dress',
            'women\'s casual dress': 'casual_dress',
            'women\'s formal dress': 'formal_dress',
            'lehenga set': 'lehenga_set',
            'lehenga choli': 'lehenga_choli',
            'lehenga skirt': 'lehenga_skirt',
            'lehenga top': 'lehenga_top',
            'saree': 'saree',
            'sari': 'saree',
            'saree blouse': 'saree_blouse',
            'saree petticoat': 'saree_petticoat',
            'women\'s sneakers': 'sneakers',
            'women\'s flats': 'flats',
            'women\'s heels': 'heels',
            'women\'s boots': 'boots',
            'women\'s sandals': 'sandals',
            'women\'s loafers': 'loafers',
            'women\'s pumps': 'pumps',
            'women\'s wedges': 'wedges',
            'women\'s stilettos': 'stilettos',
            'women\'s oxfords': 'oxfords',
            'women\'s mules': 'mules',
            'women\'s slides': 'slides',
            'women\'s tote bag': 'tote',
            'women\'s sling bag': 'sling',
            'women\'s backpack': 'backpack',
            'women\'s clutch': 'clutch',
            'women\'s handbag': 'handbag',
            'women\'s crossbody bag': 'crossbody',
            'women\'s shoulder bag': 'shoulder_bag',
            'women\'s satchel': 'satchel',
            'women\'s hobo bag': 'hobo',
            'women\'s bucket bag': 'bucket_bag',
            'women\'s messenger bag': 'messenger_bag',
            'women\'s earrings': 'earrings',
            'women\'s necklaces': 'necklaces',
            'women\'s bracelets': 'bracelets',
            'women\'s rings': 'rings',
            'women\'s belts': 'belts',
            'women\'s hair accessories': 'hair_accessory',
            'women\'s watches': 'watches',
            'women\'s scarves': 'scarves',
            'women\'s sunglasses': 'sunglasses',
            'women\'s hats': 'hats',
            'women\'s gloves': 'gloves',
            'women\'s brooches': 'brooches',
            'women\'s denim jacket': 'denim_jacket',
            'women\'s leather jacket': 'leather_jacket',
            'women\'s blazer': 'blazer',
            'women\'s cardigan': 'cardigan',
            'women\'s coat': 'coat',
            'women\'s vest': 'vest',
            # Original mappings
            'full-length dress': 'maxi_dress',
            'kurta': 'kurti',
            'lehenga choli': 'lehenga_set',
            'sari': 'saree',
            't-shirt': 't_shirt',
            'crop top': 'crop_top',
            'tank top': 'tank_top',
            'v-neck': 'v_neck',
            'off-shoulder': 'off_shoulder',
            'high neck': 'high_neck',
            'short sleeve': 'short_sleeve',
            'long sleeve': 'long_sleeve',
            'three quarter': 'three_quarter',
            'cap sleeve': 'cap_sleeve',
            'bell sleeve': 'bell_sleeve',
            'puff sleeve': 'puff_sleeve',
            'low heel': 'low_heel',
            'medium heel': 'medium_heel',
            'high heel': 'high_heel',
            'block heel': 'block_heel',
            'hair accessories': 'hair_accessory',
            'shoulder bag': 'shoulder_bag',
            'bucket bag': 'bucket_bag',
            'messenger bag': 'messenger_bag',
            'crossbody bag': 'crossbody',
            'semi-formal': 'semi_formal',
            'semi-formal wear': 'semi_formal',
            'casual wear': 'casual',
            'formal wear': 'formal',
            'party wear': 'party',
            'wedding wear': 'wedding',
            'work wear': 'work',
            'beach wear': 'beach',
            'sports wear': 'sports',
            'all season': 'all_season'
        }
        subcategory = subcategory_map.get(subcategory.lower(), subcategory.lower())
        
        return category, subcategory
    
    def classify_image(self, image_path: str) -> Dict:
        """Comprehensive classification of a single image with heuristics"""
        try:
            img = Image.open(image_path).convert("RGB")
            image_vec = self._encode_image(img)
            
            # Analyze image properties for heuristics
            image_props = self._analyze_image_properties(image_path)
            
            # Main classifications using precomputed embeddings
            category, cat_conf = self._match_with_confidence(image_vec, 'category')
            subcategory, sub_conf = self._match_with_confidence(image_vec, f'subcategory_{category}')
            
            # Apply heuristics if confidence is low or for known problematic cases
            if cat_conf < 0.20 or sub_conf < 0.15:
                category, subcategory, cat_conf, sub_conf = self._apply_heuristics(
                    image_path, category, subcategory, cat_conf, sub_conf, image_props
                )
            
            # Normalize classifications
            category, subcategory = self._normalize_classification(category, subcategory)
            
            # Special rule: Kurtis are always tops, not dresses
            if subcategory == 'kurti' or 'kurti' in subcategory.lower():
                category = 'top'
                subcategory = 'kurti'
            
            # Get other attributes
            pattern, pat_conf = self._match_with_confidence(image_vec, 'pattern')
            style_tags = []
            style_confs = []
            
            # Get top 3 style tags
            for _ in range(3):
                style, style_conf = self._match_with_confidence(image_vec, 'style')
                if style not in style_tags and style_conf > 0.2:
                    style_tags.append(style)
                    style_confs.append(style_conf)
            
            occasion, occ_conf = self._match_with_confidence(image_vec, 'occasion')
            color, col_conf = self._match_with_confidence(image_vec, 'color')
            fabric, fab_conf = self._match_with_confidence(image_vec, 'fabric')
            season, sea_conf = self._match_with_confidence(image_vec, 'season')
            tradition, trad_conf = self._match_with_confidence(image_vec, 'tradition')
            gender, gen_conf = self._match_with_confidence(image_vec, 'gender')
            
            # Additional details based on category
            additional_details = {}
            if category in ["top", "dress", "lehenga_set"]:
                neckline, neck_conf = self._match_with_confidence(image_vec, 'neckline')
                sleeve, sleeve_conf = self._match_with_confidence(image_vec, 'sleeve')
                additional_details.update({
                    'neckline': neckline,
                    'neckline_conf': neck_conf,
                    'sleeve_length': sleeve,
                    'sleeve_length_conf': sleeve_conf
                })
            
            if category in ["bottom", "dress"]:
                fit, fit_conf = self._match_with_confidence(image_vec, 'fit')
                additional_details.update({
                    'fit': fit,
                    'fit_conf': fit_conf
                })
            
            if category == "shoes":
                heel, heel_conf = self._match_with_confidence(image_vec, 'heel')
                additional_details.update({
                    'heel_type': heel,
                    'heel_conf': heel_conf
                })
            
            if category == "bag":
                bag_size, size_conf = self._match_with_confidence(image_vec, 'bag_size')
                additional_details.update({
                    'bag_size': bag_size,
                    'bag_size_conf': size_conf
                })
            
            # Calculate color properties
            dominant_color_hex = self._get_dominant_color_hex(img)
            dominant_color_h, dominant_color_s, dominant_color_v = self._rgb_to_hsv(dominant_color_hex)
            
            return {
                "category": category,
                "category_conf": cat_conf,
                "subcategory": subcategory,
                "subcategory_conf": sub_conf,
                "pattern": pattern,
                "pattern_confidence": pat_conf,
                "style_tags": style_tags,
                "style_confidence": style_confs,
                "occasion": occasion,
                "occasion_conf": occ_conf,
                "primary_color": color,
                "color_conf": col_conf,
                "fabric": fabric,
                "fabric_conf": fab_conf,
                "season": season,
                "season_conf": sea_conf,
                "tradition": tradition,
                "tradition_conf": trad_conf,
                "gender": gender,
                "gender_conf": gen_conf,
                "dominant_color_hex": dominant_color_hex,
                "dominant_color_name": color,
                "dominant_color_h": dominant_color_h,
                "dominant_color_s": dominant_color_s,
                "dominant_color_v": dominant_color_v,
                "secondary_colors": [],
                "colorfulness_score": image_props.get('saturation', 0) / 255.0,
                "brightness_score": image_props.get('brightness', 0) / 255.0,
                "width_px": image_props.get('width', 0),
                "height_px": image_props.get('height', 0),
                "aspect_ratio": image_props.get('aspect_ratio', 1.0),
                "additional_details": additional_details,
                "confidence_scores": {
                    "category": cat_conf,
                    "subcategory": sub_conf,
                    "pattern": pat_conf,
                    "style": max(style_confs) if style_confs else 0.0,
                    "occasion": occ_conf,
                    "color": col_conf,
                    "fabric": fab_conf,
                    "season": sea_conf,
                    "tradition": trad_conf,
                    "gender": gen_conf
                }
            }
            
        except Exception as e:
            print(f"Error classifying image {image_path}: {e}")
            return {
                "category": "unknown",
                "category_conf": 0.0,
                "subcategory": "unknown",
                "subcategory_conf": 0.0,
                "pattern": "solid",
                "pattern_confidence": 0.0,
                "style_tags": [],
                "style_confidence": [],
                "occasion": "casual",
                "occasion_conf": 0.0,
                "primary_color": "unknown",
                "color_conf": 0.0,
                "fabric": "cotton",
                "fabric_conf": 0.0,
                "season": "all_season",
                "season_conf": 0.0,
                "tradition": "western",
                "tradition_conf": 0.0,
                "gender": "women",
                "gender_conf": 0.0,
                "dominant_color_hex": "#000000",
                "dominant_color_name": "black",
                "dominant_color_h": 0,
                "dominant_color_s": 0,
                "dominant_color_v": 0,
                "secondary_colors": [],
                "colorfulness_score": 0.0,
                "brightness_score": 0.0,
                "width_px": 0,
                "height_px": 0,
                "aspect_ratio": 1.0,
                "additional_details": {},
                "confidence_scores": {}
            }
    
    def _get_dominant_color_hex(self, image: Image.Image) -> str:
        """Extract dominant color as hex string"""
        try:
            # Resize image for faster processing
            image = image.resize((150, 150))
            colors = image.getcolors(maxcolors=256*256*256)
            if colors:
                # Get the most frequent color
                most_frequent = max(colors, key=lambda x: x[0])
                rgb = most_frequent[1]
                return f"#{rgb[0]:02x}{rgb[1]:02x}{rgb[2]:02x}"
        except:
            pass
        return "#000000"
    
    def _rgb_to_hsv(self, hex_color: str) -> Tuple[int, int, int]:
        """Convert hex color to HSV"""
        try:
            hex_color = hex_color.lstrip('#')
            r, g, b = tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
            r, g, b = r/255.0, g/255.0, b/255.0
            
            max_val = max(r, g, b)
            min_val = min(r, g, b)
            diff = max_val - min_val
            
            # Hue
            if diff == 0:
                h = 0
            elif max_val == r:
                h = (60 * ((g - b) / diff) + 360) % 360
            elif max_val == g:
                h = (60 * ((b - r) / diff) + 120) % 360
            else:
                h = (60 * ((r - g) / diff) + 240) % 360
            
            # Saturation
            s = 0 if max_val == 0 else diff / max_val
            
            # Value
            v = max_val
            
            return int(h), int(s * 100), int(v * 100)
        except:
            return 0, 0, 0
    
    def get_image_embedding(self, image_path: str) -> Optional[np.ndarray]:
        """Get CLIP embedding for a single image"""
        try:
            if not os.path.exists(image_path):
                return None
            
            # Load and preprocess image
            image = Image.open(image_path).convert('RGB')
            inputs = self.processor(images=image, return_tensors="pt")
            
            # Move inputs to the same device as the model
            device = next(self.model.parameters()).device
            inputs = {k: v.to(device) for k, v in inputs.items()}
            
            # Get image features
            with torch.no_grad():
                image_features = self.model.get_image_features(**inputs)
                # Normalize the features
                image_features = image_features / image_features.norm(dim=-1, keepdim=True)
                
            return image_features.cpu().numpy().flatten()
        except Exception as e:
            print(f"Warning: Could not get embedding for {image_path}: {e}")
            return None

    def classify_batch(self, image_paths: List[str], show_progress: bool = True) -> List[Dict]:
        """Classify a batch of images"""
        results = []
        iterator = tqdm(image_paths, desc="Classifying images") if show_progress else image_paths
        
        for image_path in iterator:
            result = self.classify_image(image_path)
            result['filename'] = image_path
            results.append(result)
        
        return results
    
    def create_organized_dataset(self, raw_images_dir: str, output_dir: str) -> pd.DataFrame:
        """Create organized dataset with classifications"""
        print("📊 Creating organized dataset...")
        
        # Get all image files
        image_paths = []
        for root, dirs, files in os.walk(raw_images_dir):
            for file in files:
                if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                    image_paths.append(os.path.join(root, file))
        
        if not image_paths:
            print("❌ No images found!")
            return pd.DataFrame()
        
        # Classify all images
        classifications = self.classify_batch(image_paths, show_progress=True)
        
        # Create DataFrame
        df = pd.DataFrame(classifications)
        
        # Add metadata
        df['id'] = [f"item_{i:03d}" for i in range(len(df))]
        df['source'] = 'curated'
        df['created_at'] = pd.Timestamp.now().isoformat()
        
        # Save organized dataset
        os.makedirs(output_dir, exist_ok=True)
        df.to_csv(os.path.join(output_dir, 'robust_classified_dataset.csv'), index=False)
        
        print(f"✅ Created organized dataset with {len(df)} items")
        return df
