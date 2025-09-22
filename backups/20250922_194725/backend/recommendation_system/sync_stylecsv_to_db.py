#!/usr/bin/env python3
"""
Sync style.csv data to backend SQL database
Usage: python sync_stylecsv_to_db.py
"""

import os
import sys
import json
import sqlite3
from datetime import datetime

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def main():
    # Paths
    project_root = os.path.dirname(os.path.abspath(__file__))
    style_csv_path = os.path.join(project_root, "data", "processed", "style.csv")
    db_path = os.path.join(os.path.dirname(project_root), "instance", "wardrobe.db")
    
    if not os.path.exists(style_csv_path):
        print(f"Error: style.csv not found at {style_csv_path}")
        sys.exit(1)
    
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        sys.exit(1)
    
    try:
        import pandas as pd
        
        # Read style.csv
        style_df = pd.read_csv(style_csv_path)
        print(f"Loaded {len(style_df)} items from style.csv")
        
        # Filter for wardrobe items (check multiple possible source values)
        wardrobe_sources = ['wardrobe', 'custom_wardrobe', 'user_wardrobe']
        wardrobe_items = style_df[style_df['source'].isin(wardrobe_sources)]
        print(f"Found {len(wardrobe_items)} wardrobe items")
        
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get current table schema
        cursor.execute("PRAGMA table_info(wardrobe_item)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"Database columns: {columns}")
        
        # Check if we need to add new columns
        new_columns = {
            'subcategory': 'VARCHAR(100)',
            'style_tags': 'TEXT',
            'dominant_color_hex': 'VARCHAR(7)',
            'emb_index': 'INTEGER',
            'recommendation_id': 'VARCHAR(100)'
        }
        
        for col_name, col_type in new_columns.items():
            if col_name not in columns:
                try:
                    cursor.execute(f"ALTER TABLE wardrobe_item ADD COLUMN {col_name} {col_type}")
                    print(f"Added column: {col_name}")
                except sqlite3.Error as e:
                    print(f"Warning: Could not add column {col_name}: {e}")
        
        conn.commit()
        
        # Insert/update items
        inserted_count = 0
        updated_count = 0
        
        for idx, row in wardrobe_items.iterrows():
            try:
                # Check if item already exists (by filename or recommendation_id)
                filename = os.path.basename(row['filename'])
                
                # Try to find by recommendation_id first
                cursor.execute("SELECT id FROM wardrobe_item WHERE recommendation_id = ?", (row['id'],))
                existing = cursor.fetchone()
                
                if existing:
                    # Update existing item
                    cursor.execute("""
                        UPDATE wardrobe_item SET 
                            category = ?, subcategory = ?, style_tags = ?, 
                            dominant_color_hex = ?, emb_index = ?, recommendation_id = ?
                        WHERE recommendation_id = ?
                    """, (
                        row['category'],
                        row.get('subcategory', ''),
                        json.dumps(row.get('style_tags', [])),
                        row.get('dominant_color_hex', ''),
                        row.get('emb_index', 0),
                        row['id'],
                        row['id']
                    ))
                    updated_count += 1
                else:
                    # Insert new item
                    cursor.execute("""
                        INSERT INTO wardrobe_item 
                        (image_url, category, subcategory, style_tags, dominant_color_hex, 
                         emb_index, recommendation_id, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        f"/uploads/{filename}",  # Relative path for serving
                        row['category'],
                        row.get('subcategory', ''),
                        json.dumps(row.get('style_tags', [])),
                        row.get('dominant_color_hex', ''),
                        row.get('emb_index', 0),
                        row['id'],
                        datetime.now().isoformat()
                    ))
                    inserted_count += 1
                    
            except Exception as e:
                print(f"Error processing item {row['id']}: {e}")
                continue
        
        conn.commit()
        conn.close()
        
        print(f"Sync completed:")
        print(f"  Inserted: {inserted_count} items")
        print(f"  Updated: {updated_count} items")
        print(f"  Total processed: {inserted_count + updated_count} items")
        
    except Exception as e:
        print(f"Error during sync: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
