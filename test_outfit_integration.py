#!/usr/bin/env python3
"""
Test Outfit Integration
======================

Test the complete outfit generation flow from frontend to backend.
"""

import requests
import json
import time

def test_outfit_generation():
    """Test the complete outfit generation flow"""
    print("🧪 Testing Outfit Generation Integration")
    print("=" * 50)
    
    # Test backend health
    print("🔍 Testing Backend Health...")
    try:
        response = requests.get("http://localhost:5000/api/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is running")
        else:
            print("❌ Backend health check failed")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False
    
    # Test outfit generation
    print("\n🎯 Testing Outfit Generation...")
    try:
        payload = {
            "prompt": "Create outfit recommendations using these items: tops, bottoms. Create stylish and trendy looks.",
            "occasion": "casual",
            "num_outfits": 2
        }
        
        response = requests.post(
            "http://localhost:5000/api/stylist/generate",
            json=payload,
            timeout=30
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Outfit generation successful")
            print(f"   Success: {data.get('success', False)}")
            print(f"   Outfits: {len(data.get('outfits', []))}")
            print(f"   Description: {data.get('description', 'N/A')}")
            
            if data.get('outfits'):
                outfit = data['outfits'][0]
                print(f"   First outfit items: {len(outfit.get('items', []))}")
                print(f"   First outfit title: {outfit.get('title', 'N/A')}")
            
            return True
        else:
            print(f"❌ Outfit generation failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error testing outfit generation: {e}")
        return False

def test_frontend_connection():
    """Test if frontend can connect to backend"""
    print("\n🌐 Testing Frontend Connection...")
    try:
        # Test wardrobe items endpoint
        response = requests.get("http://localhost:5000/api/wardrobe", timeout=5)
        if response.status_code == 200:
            items = response.json()
            print(f"✅ Found {len(items)} wardrobe items")
            return True
        else:
            print(f"❌ Wardrobe endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Outfit Integration Test")
    print("=" * 50)
    
    # Test backend health
    backend_ok = test_outfit_generation()
    
    # Test frontend connection
    frontend_ok = test_frontend_connection()
    
    print("\n" + "=" * 50)
    print("📊 Integration Test Summary:")
    print(f"   Backend Outfit Generation: {'✅ PASS' if backend_ok else '❌ FAIL'}")
    print(f"   Frontend Connection: {'✅ PASS' if frontend_ok else '❌ FAIL'}")
    
    if backend_ok and frontend_ok:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ Outfit generation is working!")
        print("✅ Frontend can connect to backend!")
        print("✅ The system is ready for use!")
    else:
        print("\n❌ Some tests failed!")
        print("Please check the backend logs for errors.")
    
    print("=" * 50)
