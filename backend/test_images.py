#!/usr/bin/env python3
"""
Test script to verify that uploaded images are accessible via HTTP
"""
import requests
import os

def test_image_access():
    """Test if uploaded images are accessible via HTTP"""
    print("🖼️  Testing Image Access")
    print("=" * 30)
    
    # Check if uploads directory exists
    uploads_dir = "uploads"
    if not os.path.exists(uploads_dir):
        print("❌ Uploads directory not found!")
        return
    
    # Get list of uploaded files
    files = os.listdir(uploads_dir)
    if not files:
        print("❌ No files found in uploads directory!")
        return
    
    print(f"📁 Found {len(files)} files in uploads directory:")
    
    # Test each file
    for filename in files:
        if filename.lower().endswith(('.jpg', '.jpeg', '.png', '.gif', '.webp')):
            url = f"http://localhost:5000/uploads/{filename}"
            try:
                response = requests.get(url, timeout=5)
                if response.status_code == 200:
                    print(f"✅ {filename} - Accessible ({len(response.content)} bytes)")
                else:
                    print(f"❌ {filename} - HTTP {response.status_code}")
            except requests.exceptions.RequestException as e:
                print(f"❌ {filename} - Error: {e}")
        else:
            print(f"⚠️  {filename} - Not an image file")
    
    print("\n🎯 Test complete!")
    print("If you see ✅ for your images, they should display in the frontend!")

if __name__ == "__main__":
    test_image_access()
