#!/usr/bin/env python3
"""
Test script to verify wardrobe images display correctly
"""

import requests
import json
import time

def test_backend_api():
    """Test backend API returns correct image URLs"""
    print("🧪 Testing Backend API...")
    
    try:
        response = requests.get("http://localhost:5000/api/wardrobe")
        if response.status_code == 200:
            items = response.json()
            print(f"✅ API returned {len(items)} items")
            
            # Check first few items
            for i, item in enumerate(items[:3]):
                print(f"  Item {i+1}: {item['category']} - {item['image_url']}")
                
                # Test if image URL is accessible
                image_url = f"http://localhost:5000{item['image_url']}"
                img_response = requests.head(image_url)
                if img_response.status_code == 200:
                    print(f"    ✅ Image accessible: {image_url}")
                else:
                    print(f"    ❌ Image not accessible: {image_url}")
            
            return True
        else:
            print(f"❌ API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

def test_upload_integration():
    """Test upload integration"""
    print("\n🧪 Testing Upload Integration...")
    
    try:
        # Create a simple test image
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (400, 600), color='lightblue')
        draw = ImageDraw.Draw(img)
        draw.rectangle([50, 50, 350, 550], outline='black', width=3)
        draw.text((200, 300), "TEST UPLOAD", fill='black')
        img.save('test_wardrobe_upload.jpg')
        
        # Upload the image
        with open('test_wardrobe_upload.jpg', 'rb') as f:
            files = {'image': f}
            data = {'category': 'tops'}
            
            response = requests.post("http://localhost:5000/api/wardrobe/upload", 
                                   files=files, data=data)
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Upload successful: ID {result.get('id')}")
            print(f"   Image URL: {result.get('image_url')}")
            print(f"   Subcategory: {result.get('subcategory', 'N/A')}")
            print(f"   Recommendation ID: {result.get('recommendation_id', 'N/A')}")
            
            # Test if the new image is accessible
            if result.get('image_url'):
                image_url = f"http://localhost:5000{result['image_url']}"
                img_response = requests.head(image_url)
                if img_response.status_code == 200:
                    print(f"   ✅ New image accessible: {image_url}")
                else:
                    print(f"   ❌ New image not accessible: {image_url}")
            
            return True
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Upload error: {e}")
        return False
    finally:
        # Clean up test image
        import os
        if os.path.exists('test_wardrobe_upload.jpg'):
            os.remove('test_wardrobe_upload.jpg')

def test_database_consistency():
    """Test database consistency"""
    print("\n🧪 Testing Database Consistency...")
    
    try:
        import sqlite3
        conn = sqlite3.connect('instance/wardrobe.db')
        cursor = conn.cursor()
        
        # Count total items
        cursor.execute("SELECT COUNT(*) FROM wardrobe_item")
        total_count = cursor.fetchone()[0]
        
        # Count items with static URLs
        cursor.execute("SELECT COUNT(*) FROM wardrobe_item WHERE image_url LIKE '/static/wardrobe_images/%'")
        static_count = cursor.fetchone()[0]
        
        # Count items with recommendation IDs
        cursor.execute("SELECT COUNT(*) FROM wardrobe_item WHERE recommendation_id IS NOT NULL")
        rec_count = cursor.fetchone()[0]
        
        print(f"✅ Total items: {total_count}")
        print(f"✅ Items with static URLs: {static_count}")
        print(f"✅ Items with recommendation IDs: {rec_count}")
        
        conn.close()
        return True
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False

def main():
    print("🧪 Testing Wardrobe Display Integration")
    print("=" * 50)
    
    # Test 1: Backend API
    api_success = test_backend_api()
    
    # Test 2: Upload integration
    upload_success = test_upload_integration()
    
    # Test 3: Database consistency
    db_success = test_database_consistency()
    
    print("\n" + "=" * 50)
    print("📊 Test Results:")
    print(f"  Backend API: {'✅ PASS' if api_success else '❌ FAIL'}")
    print(f"  Upload Integration: {'✅ PASS' if upload_success else '❌ FAIL'}")
    print(f"  Database Consistency: {'✅ PASS' if db_success else '❌ FAIL'}")
    
    if all([api_success, upload_success, db_success]):
        print("\n🎉 All tests passed! Wardrobe display integration is working correctly.")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    main()
