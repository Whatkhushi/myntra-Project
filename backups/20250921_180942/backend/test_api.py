#!/usr/bin/env python3
"""
Simple test script for the Wardrobe API
"""
import requests
import json
import os
from io import BytesIO
from PIL import Image

# Test configuration
BASE_URL = "http://localhost:5000"
TEST_IMAGE_PATH = "test_image.png"

def create_test_image():
    """Create a simple test image"""
    # Create a simple 100x100 red image
    img = Image.new('RGB', (100, 100), color='red')
    img.save(TEST_IMAGE_PATH)
    print(f"Created test image: {TEST_IMAGE_PATH}")

def test_health_check():
    """Test the health check endpoint"""
    print("Testing health check...")
    try:
        response = requests.get(f"{BASE_URL}/api/health")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_upload_item():
    """Test uploading a wardrobe item"""
    print("\nTesting wardrobe item upload...")
    try:
        # Create test image if it doesn't exist
        if not os.path.exists(TEST_IMAGE_PATH):
            create_test_image()
        
        # Prepare the upload
        with open(TEST_IMAGE_PATH, 'rb') as f:
            files = {'image': f}
            data = {'category': 'tops'}
            
            response = requests.post(f"{BASE_URL}/api/wardrobe/upload", files=files, data=data)
        
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 201:
            return response.json()
        return None
        
    except Exception as e:
        print(f"Upload test failed: {e}")
        return None

def test_get_items():
    """Test retrieving all wardrobe items"""
    print("\nTesting get all wardrobe items...")
    try:
        response = requests.get(f"{BASE_URL}/api/wardrobe")
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Get items test failed: {e}")
        return False

def cleanup():
    """Clean up test files"""
    if os.path.exists(TEST_IMAGE_PATH):
        os.remove(TEST_IMAGE_PATH)
        print(f"Cleaned up {TEST_IMAGE_PATH}")

def main():
    """Run all tests"""
    print("Starting Wardrobe API Tests")
    print("=" * 40)
    
    # Test health check
    health_ok = test_health_check()
    
    if not health_ok:
        print("Health check failed. Make sure the server is running.")
        return
    
    # Test upload
    uploaded_item = test_upload_item()
    
    # Test get items
    get_ok = test_get_items()
    
    # Cleanup
    cleanup()
    
    print("\n" + "=" * 40)
    print("Test Summary:")
    print(f"Health Check: {'PASS' if health_ok else 'FAIL'}")
    print(f"Upload Item: {'PASS' if uploaded_item else 'FAIL'}")
    print(f"Get Items: {'PASS' if get_ok else 'FAIL'}")

if __name__ == "__main__":
    main()
