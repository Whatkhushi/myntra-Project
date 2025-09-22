#!/usr/bin/env python3
"""
Setup wardrobe images for frontend display
Copies images to static folder and updates database with proper URLs
"""

import os
import sys
import shutil
import uuid
from pathlib import Path
import sqlite3
import pandas as pd

def main():
    # Paths
    project_root = os.path.dirname(os.path.abspath(__file__))
    style_csv_path = os.path.join(project_root, "data", "processed", "style.csv")
    static_folder = os.path.join(os.path.dirname(project_root), "static", "wardrobe_images")
    db_path = os.path.join(os.path.dirname(project_root), "instance", "wardrobe.db")
    
    print(f"Setting up wardrobe images...")
    print(f"Style CSV: {style_csv_path}")
    print(f"Static folder: {static_folder}")
    print(f"Database: {db_path}")
    
    # Ensure static folder exists
    os.makedirs(static_folder, exist_ok=True)
    
    # Read style.csv
    df = pd.read_csv(style_csv_path)
    wardrobe_items = df[df['source'].isin(['wardrobe', 'custom_wardrobe', 'user_wardrobe'])]
    print(f"Found {len(wardrobe_items)} wardrobe items")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Get current table schema
    cursor.execute("PRAGMA table_info(wardrobe_item)")
    columns = [row[1] for row in cursor.fetchall()]
    print(f"Database columns: {columns}")
    
    # Ensure we have the recommendation_id column
    if 'recommendation_id' not in columns:
        cursor.execute("ALTER TABLE wardrobe_item ADD COLUMN recommendation_id VARCHAR(100)")
        print("Added recommendation_id column")
    
    # Process each wardrobe item
    copied_count = 0
    updated_count = 0
    
    for idx, row in wardrobe_items.iterrows():
        try:
            source_file = row['filename']
            
            # Check if source file exists
            if not os.path.exists(source_file):
                print(f"Warning: Source file not found: {source_file}")
                continue
            
            # Generate unique filename for static folder
            file_ext = os.path.splitext(source_file)[1]
            unique_filename = f"{row['id']}{file_ext}"
            dest_file = os.path.join(static_folder, unique_filename)
            
            # Copy file to static folder
            shutil.copy2(source_file, dest_file)
            print(f"Copied: {os.path.basename(source_file)} -> {unique_filename}")
            copied_count += 1
            
            # Create static URL
            static_url = f"/static/wardrobe_images/{unique_filename}"
            
            # Update database
            # First check if item exists by recommendation_id
            cursor.execute("SELECT id FROM wardrobe_item WHERE recommendation_id = ?", (row['id'],))
            existing = cursor.fetchone()
            
            if existing:
                # Update existing item
                cursor.execute("""
                    UPDATE wardrobe_item SET 
                        image_url = ?, subcategory = ?, style_tags = ?, 
                        dominant_color_hex = ?, recommendation_id = ?
                    WHERE recommendation_id = ?
                """, (
                    static_url,
                    row.get('subcategory', ''),
                    '[]',  # Default empty array
                    row.get('dominant_color_hex', ''),
                    row['id'],
                    row['id']
                ))
                updated_count += 1
                print(f"Updated existing item: {row['id']}")
            else:
                # Insert new item
                cursor.execute("""
                    INSERT INTO wardrobe_item 
                    (image_url, category, subcategory, style_tags, dominant_color_hex, 
                     recommendation_id, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    static_url,
                    row['category'],
                    row.get('subcategory', ''),
                    '[]',  # Default empty array
                    row.get('dominant_color_hex', ''),
                    row['id'],
                    '2025-09-21T00:00:00'  # Default timestamp
                ))
                updated_count += 1
                print(f"Inserted new item: {row['id']}")
                
        except Exception as e:
            print(f"Error processing item {row['id']}: {e}")
            continue
    
    conn.commit()
    conn.close()
    
    print(f"\nSetup completed:")
    print(f"  Images copied: {copied_count}")
    print(f"  Database records updated: {updated_count}")
    print(f"  Static folder: {static_folder}")
    
    # Verify setup
    print(f"\nVerifying setup...")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM wardrobe_item WHERE recommendation_id IS NOT NULL")
    count = cursor.fetchone()[0]
    print(f"  Wardrobe items in database: {count}")
    conn.close()

if __name__ == "__main__":
    main()
