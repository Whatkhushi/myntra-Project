#!/usr/bin/env python3
"""
Outfit Generation Adapter
========================

This module provides an adapter interface between the Flask backend
and the recommendation system for generating outfit recommendations.
"""

import os
import sys
import json
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime

# Add recommendation system to path
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
RECOMMENDATION_SYSTEM_DIR = os.path.join(PROJECT_ROOT, 'recommendation_system')
SRC_DIR = os.path.join(RECOMMENDATION_SYSTEM_DIR, 'src')

if SRC_DIR not in sys.path:
    sys.path.append(SRC_DIR)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import recommendation system modules
try:
    # Change to recommendation system directory for proper imports
    original_cwd = os.getcwd()
    os.chdir(RECOMMENDATION_SYSTEM_DIR)
    
    from src.data.robust_data_manager import RobustDataManager, EmbeddingIndex
    from src.recommend.robust_recommender import RobustOutfitRecommender
    
    # Change back to original directory
    os.chdir(original_cwd)
    
    logger.info("✅ Successfully imported recommendation system modules")
except ImportError as e:
    logger.error(f"Failed to import recommendation system modules: {e}")
    # Create mock classes for fallback
    class MockDataManager:
        def __init__(self, *args, **kwargs):
            pass
        def load_datasets(self):
            return None, None
        def generate_embeddings(self, *args, **kwargs):
            return None
    
    class MockRecommender:
        def __init__(self, *args, **kwargs):
            pass
        def recommend_outfits(self, *args, **kwargs):
            return []
    
    RobustDataManager = MockDataManager
    RobustOutfitRecommender = MockRecommender
    EmbeddingIndex = None

class OutfitGenerationAdapter:
    """Adapter for generating outfit recommendations using the recommendation system."""
    
    def __init__(self):
        self.initialized = False
        self.data_manager = None
        self.recommender = None
        self.embedding_index = None
        self.wardrobe_df = None
        self.catalog_df = None
        
    def _initialize_system(self):
        """Initialize the recommendation system components"""
        try:
            logger.info("🚀 Initializing outfit generation adapter...")
            
            # Change to recommendation system directory for imports
            original_cwd = os.getcwd()
            os.chdir(RECOMMENDATION_SYSTEM_DIR)
            
            try:
                # Set up paths
                raw_dir = os.path.join(RECOMMENDATION_SYSTEM_DIR, 'data', 'raw')
                processed_dir = os.path.join(RECOMMENDATION_SYSTEM_DIR, 'data', 'processed')
                output_dir = os.path.join(RECOMMENDATION_SYSTEM_DIR, 'data', 'output')
                
                # Initialize data manager
                self.data_manager = RobustDataManager(
                    raw_dir=raw_dir,
                    processed_dir=processed_dir,
                    output_dir=output_dir
                )
            finally:
                # Change back to original directory
                os.chdir(original_cwd)
            
            # Load datasets
            self.wardrobe_df, self.catalog_df = self.data_manager.load_enhanced_datasets()
            
            # Get user wardrobe data from database
            try:
                from app import app, db, WardrobeItem
                
                with app.app_context():
                    # Get all wardrobe items from database
                    db_items = WardrobeItem.query.all()
                    
                    if db_items:
                        logger.info(f"📁 Found {len(db_items)} items in user wardrobe")
                        
                        # Convert database items to DataFrame format
                        import pandas as pd
                        
                        wardrobe_data = []
                        for item in db_items:
                            wardrobe_data.append({
                                'id': item.id,
                                'category': item.category,
                                'subcategory': item.subcategory or 'unknown',
                                'color': getattr(item, 'color', 'unknown') or 'unknown',
                                'style_tags': getattr(item, 'style_tags', ['casual']) or ['casual'],
                                'image_url': item.image_url,
                                'description': item.description or f"{item.category} item",
                                'filename': item.image_url.split('/')[-1] if item.image_url else None
                            })
                        
                        # Create DataFrame from user data
                        user_wardrobe_df = pd.DataFrame(wardrobe_data)
                        
                        # Merge with existing wardrobe data or use user data
                        if self.wardrobe_df is not None and not self.wardrobe_df.empty:
                            # Combine user data with existing data
                            self.wardrobe_df = pd.concat([self.wardrobe_df, user_wardrobe_df], ignore_index=True)
                            logger.info(f"📊 Combined user data with existing data: {len(self.wardrobe_df)} total items")
                        else:
                            # Use only user data
                            self.wardrobe_df = user_wardrobe_df
                            logger.info(f"📊 Using user wardrobe data: {len(self.wardrobe_df)} items")
                    else:
                        logger.warning("⚠️ No user wardrobe data found in database")
                        if self.wardrobe_df is None or self.wardrobe_df.empty:
                            logger.warning("⚠️ No wardrobe data found. Creating sample data...")
                            self._create_sample_data()
                            
            except Exception as e:
                logger.error(f"❌ Error loading user wardrobe data: {e}")
                if self.wardrobe_df is None or self.wardrobe_df.empty:
                    logger.warning("⚠️ No wardrobe data found. Creating sample data...")
                    self._create_sample_data()
            
            # Generate embeddings
            self.embedding_index = self.data_manager.generate_embeddings(
                self.wardrobe_df, 
                self.catalog_df
            )
            
            # Initialize recommender
            self.recommender = RobustOutfitRecommender(
                wardrobe_df=self.wardrobe_df,
                catalog_df=self.catalog_df,
                embedding_index=self.embedding_index,
                image_base_dir=raw_dir,
                output_dir=output_dir
            )
            
            self.initialized = True
            logger.info("✅ Outfit generation adapter initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize adapter: {e}")
            self.initialized = False
    
    def _create_sample_data(self):
        """Create sample data when no wardrobe data is available"""
        try:
            import pandas as pd
            
            # Create sample wardrobe data
            sample_data = [
                {
                    'id': 'sample_001',
                    'category': 'tops',
                    'subcategory': 't_shirt',
                    'color': 'white',
                    'style_tags': ['casual'],
                    'image_url': '/placeholder.jpg',
                    'description': 'White casual t-shirt'
                },
                {
                    'id': 'sample_002', 
                    'category': 'bottoms',
                    'subcategory': 'jeans',
                    'color': 'blue',
                    'style_tags': ['casual'],
                    'image_url': '/placeholder.jpg',
                    'description': 'Blue casual jeans'
                }
            ]
            
            self.wardrobe_df = pd.DataFrame(sample_data)
            self.catalog_df = pd.DataFrame()
            
            logger.info("✅ Created sample data")
            
        except Exception as e:
            logger.error(f"Failed to create sample data: {e}")
    
    def generate_outfit_recommendations(
        self, 
        user_prompt: str,
        occasion: str = 'casual',
        num_outfits: int = 3,
        seed_item_ids: Optional[List[str]] = None
    ) -> Dict:
        """Generate outfit recommendations using the recommendation system."""
        
        try:
            # Always try to initialize with fresh data
            self._initialize_system()
            
            if not self.initialized:
                logger.error("❌ System not initialized, using fallback")
                return self._create_fallback_response(user_prompt, occasion)
            
            logger.info(f"🎯 Generating outfit recommendations for: {user_prompt}")
            logger.info(f"   Occasion: {occasion}, Outfits: {num_outfits}")
            
            # Use the initialized recommender directly
            if self.recommender is None:
                logger.error("❌ Recommender not initialized")
                return self._create_fallback_response(user_prompt, occasion)
            
            # Get seed items - use provided IDs or all available items
            if seed_item_ids:
                # Filter to only include items that exist in wardrobe
                available_seed_items = [item_id for item_id in seed_item_ids 
                                      if item_id in self.wardrobe_df['id'].values]
                if not available_seed_items:
                    available_seed_items = self.wardrobe_df['id'].tolist()[:5]
            else:
                available_seed_items = self.wardrobe_df['id'].tolist()[:5]
            
            logger.info(f"   Using seed items: {available_seed_items}")
            
            # Generate recommendations
            outfits = self.recommender.recommend_outfits(
                seed_item_ids=available_seed_items,
                occasion=occasion,
                num_outfits=num_outfits
            )
            
            if outfits:
                # Fix image URLs
                outfits = self._fix_image_urls(outfits)
                
                response = {
                    'success': True,
                    'description': f"AI-generated {occasion} outfit recommendations based on your wardrobe",
                    'image_url': None,
                    'outfits': outfits,
                    'total_outfits': len(outfits),
                    'user_prompt': user_prompt,
                    'occasion': occasion,
                    'generated_at': datetime.now().isoformat(),
                    'metadata': {
                        'system_version': '1.0.0',
                        'recommendation_engine': 'robust_recommender'
                    }
                }
                
                logger.info(f"✅ Generated {len(outfits)} outfit recommendations")
                return response
            else:
                logger.warning("⚠️ No outfits generated, creating fallback response")
                return self._create_fallback_response(user_prompt, occasion)
            
        except Exception as e:
            logger.error(f"❌ Error generating outfit recommendations: {e}")
            return self._create_fallback_response(user_prompt, occasion)
    
    def _fix_image_urls(self, outfits: List[Dict]) -> List[Dict]:
        """Fix image URLs to use correct paths from database"""
        try:
            # Import here to avoid circular imports
            from app import app, db, WardrobeItem
            
            with app.app_context():
                # Get all wardrobe items from database
                db_items = WardrobeItem.query.all()
                db_image_map = {}
                
                # Create mapping from filename to correct image URL
                for item in db_items:
                    filename = item.image_url.split('/')[-1]  # Get just the filename
                    db_image_map[filename] = item.image_url
                
                # Fix image URLs in outfits
                for outfit in outfits:
                    if 'items' in outfit:
                        for item in outfit['items']:
                            if 'image_url' in item and item['image_url']:
                                # Extract filename from the old path
                                old_filename = item['image_url'].split('/')[-1]
                                if old_filename in db_image_map:
                                    item['image_url'] = db_image_map[old_filename]
                                    logger.info(f"Fixed image URL for {item['id']}: {old_filename} -> {item['image_url']}")
                                else:
                                    # If filename not found in database, try to find a similar item
                                    logger.warning(f"Filename {old_filename} not found in database for item {item['id']}")
                                    # Use a placeholder or the first available item of the same category
                                    category_items = [i for i in db_items if i.category == item.get('category', '')]
                                    if category_items:
                                        item['image_url'] = category_items[0].image_url
                                        logger.info(f"Using fallback image for {item['id']}: {item['image_url']}")
                
                return outfits
                
        except Exception as e:
            logger.error(f"Error fixing image URLs: {e}")
            return outfits
    
    def _create_fallback_response(self, user_prompt: str, occasion: str) -> Dict:
        """Create a fallback response when no outfits can be generated"""
        return {
            'success': True,
            'description': f"Stylish {occasion} look inspired by: {user_prompt}",
            'image_url': None,
            'outfits': [{
                'id': 'fallback_001',
                'title': f'{occasion.title()} Look',
                'description': f'A stylish {occasion} outfit inspired by your request',
                'occasion': occasion,
                'score': 0.8,
                'items': [],
                'image_url': None,
                'styling_tips': ['Mix and match from your wardrobe', 'Add accessories for a complete look']
            }],
            'total_outfits': 1,
            'user_prompt': user_prompt,
            'occasion': occasion,
            'generated_at': datetime.now().isoformat(),
            'metadata': {
                'system_version': '1.0.0',
                'recommendation_engine': 'fallback'
            }
        }

# Global adapter instance
_adapter_instance = None

def get_outfit_adapter() -> OutfitGenerationAdapter:
    """Get the global outfit generation adapter instance"""
    global _adapter_instance
    if _adapter_instance is None:
        _adapter_instance = OutfitGenerationAdapter()
    return _adapter_instance

def generate_outfit_recommendations(
    user_prompt: str,
    occasion: str = 'casual',
    num_outfits: int = 3,
    seed_item_ids: Optional[List[str]] = None
) -> Dict:
    """Generate outfit recommendations using the global adapter"""
    adapter = get_outfit_adapter()
    return adapter.generate_outfit_recommendations(
        user_prompt=user_prompt,
        occasion=occasion,
        num_outfits=num_outfits,
        seed_item_ids=seed_item_ids
    )
