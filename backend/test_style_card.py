#!/usr/bin/env python3
"""
Test script for Style Card integration
"""

import requests
import json

def test_style_card_api():
    """Test the style card API endpoint"""
    print("🧪 Testing Style Card API...")
    
    try:
        response = requests.get("http://localhost:5000/api/style-card")
        if response.status_code == 200:
            data = response.json()
            print("✅ Style Card API working")
            print(f"   Total items: {data.get('total_items', 0)}")
            print("   Style breakdown:")
            for vibe, percentage in data.items():
                if vibe != 'total_items' and percentage > 0:
                    print(f"     {vibe}: {percentage}%")
            return True
        else:
            print(f"❌ API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API error: {e}")
        return False

def test_wardrobe_api():
    """Test the wardrobe API to ensure items are available"""
    print("\n🧪 Testing Wardrobe API...")
    
    try:
        response = requests.get("http://localhost:5000/api/wardrobe")
        if response.status_code == 200:
            items = response.json()
            print(f"✅ Wardrobe API working - {len(items)} items")
            
            # Check for items with recommendation IDs
            rec_items = [item for item in items if item.get('recommendation_id')]
            print(f"   Items with recommendation IDs: {len(rec_items)}")
            
            return True
        else:
            print(f"❌ Wardrobe API failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Wardrobe API error: {e}")
        return False

def main():
    print("🧪 Testing Style Card Integration")
    print("=" * 40)
    
    # Test 1: Wardrobe API
    wardrobe_success = test_wardrobe_api()
    
    # Test 2: Style Card API
    style_card_success = test_style_card_api()
    
    print("\n" + "=" * 40)
    print("📊 Test Results:")
    print(f"  Wardrobe API: {'✅ PASS' if wardrobe_success else '❌ FAIL'}")
    print(f"  Style Card API: {'✅ PASS' if style_card_success else '❌ FAIL'}")
    
    if wardrobe_success and style_card_success:
        print("\n🎉 Style Card integration is working correctly!")
        print("\nNext steps:")
        print("1. Open frontend at http://localhost:8082")
        print("2. Navigate to Style Card tab")
        print("3. Verify pie chart displays with Gen-Z vibes")
        print("4. Click on vibe cards to see modals")
    else:
        print("\n⚠️  Some tests failed. Check the logs above for details.")

if __name__ == "__main__":
    main()
