
import sys
import os
sys.path.append('src')

from src.data.robust_data_manager import RobustDataManager
from src.recommend.robust_recommender import RobustOutfitRecommender

# Initialize system
raw_dir = 'data/raw'
processed_dir = 'data/processed'
output_dir = 'data/output'

data_manager = RobustDataManager(raw_dir=raw_dir, processed_dir=processed_dir, output_dir=output_dir)
wardrobe_df, catalog_df = data_manager.load_enhanced_datasets()

if wardrobe_df is not None and not wardrobe_df.empty:
    # Generate embeddings
    embedding_index = data_manager.generate_embeddings(wardrobe_df, catalog_df)
    
    # Initialize recommender
    recommender = RobustOutfitRecommender(
        wardrobe_df=wardrobe_df,
        catalog_df=catalog_df,
        embedding_index=embedding_index,
        image_base_dir=raw_dir,
        output_dir=output_dir
    )
    
    # Get seed items
    seed_items = wardrobe_df['id'].tolist()[:5]
    
    # Generate recommendations
    outfits = recommender.recommend_outfits(
        seed_item_ids=seed_items,
        occasion='casual',
        num_outfits=2
    )
    
    print("OUTFITS_START")
    import json
    print(json.dumps(outfits))
    print("OUTFITS_END")
else:
    print("NO_DATA")
