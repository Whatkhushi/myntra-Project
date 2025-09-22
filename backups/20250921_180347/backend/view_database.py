#!/usr/bin/env python3
"""
Simple script to view the wardrobe database contents
"""
import sqlite3
import os
from datetime import datetime

def view_database():
    """View all wardrobe items in the database"""
    db_path = 'instance/wardrobe.db'
    
    if not os.path.exists(db_path):
        print("❌ Database file not found!")
        print(f"Looking for: {os.path.abspath(db_path)}")
        return
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get table info
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        print(f"📊 Tables in database: {[table[0] for table in tables]}")
        print()
        
        # Get all wardrobe items
        cursor.execute("SELECT * FROM wardrobe_item ORDER BY created_at DESC;")
        items = cursor.fetchall()
        
        if not items:
            print("📭 No wardrobe items found in database.")
            print("Try uploading an item through your React app first!")
            return
        
        print(f"👗 Found {len(items)} wardrobe items:")
        print("=" * 60)
        
        for item in items:
            item_id, image_url, category, created_at = item
            print(f"🆔 ID: {item_id}")
            print(f"📷 Image: {image_url}")
            print(f"🏷️  Category: {category}")
            print(f"📅 Added: {created_at}")
            print("-" * 40)
        
        conn.close()
        print("✅ Database view complete!")
        
    except Exception as e:
        print(f"❌ Error reading database: {e}")

if __name__ == "__main__":
    print("🗄️  Wardrobe Database Viewer")
    print("=" * 30)
    view_database()
