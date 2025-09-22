#!/usr/bin/env python3
"""
Integration Test Script
Tests the upload functionality with recommendation system integration
"""

import os
import sys
import requests
import json
import time
from PIL import Image, ImageDraw

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (400, 600), color='lightblue')
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 350, 550], outline='black', width=3)
    draw.text((200, 300), "TEST ITEM", fill='black')
    
    test_image_path = 'test_upload.jpg'
    img.save(test_image_path)
    return test_image_path

def test_backend_health():
    """Test if backend is running"""
    try:
        response = requests.get("http://localhost:5000/api/health")
        if response.status_code == 200:
            print("✅ Backend is running")
            return True
        else:
            print(f"❌ Backend health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Backend not accessible: {e}")
        return False

def test_wardrobe_endpoints():
    """Test wardrobe endpoints"""
    try:
        # Test GET wardrobe
        response = requests.get("http://localhost:5000/api/wardrobe")
        if response.status_code == 200:
            items = response.json()
            print(f"✅ GET wardrobe: {len(items)} items found")
            return len(items)
        else:
            print(f"❌ GET wardrobe failed: {response.status_code}")
            return 0
    except Exception as e:
        print(f"❌ Error testing wardrobe endpoints: {e}")
        return 0

def test_upload_integration():
    """Test upload with recommendation system integration"""
    try:
        # Create test image
        test_image_path = create_test_image()
        
        # Prepare upload data
        with open(test_image_path, 'rb') as f:
            files = {'image': f}
            data = {'category': 'tops'}
            
            response = requests.post("http://localhost:5000/api/wardrobe/upload", 
                                   files=files, data=data)
        
        if response.status_code == 201:
            result = response.json()
            print(f"✅ Upload successful: ID {result.get('id')}")
            print(f"   Category: {result.get('category')}")
            print(f"   Subcategory: {result.get('subcategory', 'N/A')}")
            print(f"   Recommendation ID: {result.get('recommendation_id', 'N/A')}")
            return result.get('id')
        else:
            print(f"❌ Upload failed: {response.status_code}")
            print(f"   Error: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Error testing upload: {e}")
        return None
    finally:
        # Clean up test image
        if os.path.exists(test_image_path):
            os.remove(test_image_path)

def test_cli_directly():
    """Test the CLI directly"""
    test_image_path = None
    try:
        # Create test image
        test_image_path = create_test_image()
        
        # Call CLI directly
        import subprocess
        cli_path = os.path.join(os.getcwd(), 'recommendation_system', 'add_item_cli.py')
        cmd = [
            'python3', cli_path,
            '--file', os.path.abspath(test_image_path),
            '--main_category', 'tops',
            '--source', 'wardrobe'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            print(f"❌ CLI failed with return code {result.returncode}")
            print(f"Stdout: {result.stdout}")
            print(f"Stderr: {result.stderr}")
            return False
        
        # Parse JSON from stdout (extract JSON from the end of output)
        try:
            # Find the JSON part (it should be the last line)
            lines = result.stdout.strip().split('\n')
            json_line = None
            for line in reversed(lines):
                if line.strip().startswith('{'):
                    json_line = line.strip()
                    break
            
            if json_line is None:
                print(f"❌ No JSON found in CLI output")
                print(f"Stdout: {result.stdout}")
                return False
                
            cli_output = json.loads(json_line)
        except json.JSONDecodeError as e:
            print(f"❌ Failed to parse CLI output as JSON: {e}")
            print(f"JSON line: {json_line}")
            return False
        
        if cli_output['status'] == 'ok':
            print(f"✅ CLI test successful: {cli_output['metadata']['id']}")
            return True
        else:
            print(f"❌ CLI test failed: {cli_output.get('error')}")
            return False
            
    except Exception as e:
        print(f"❌ CLI test error: {e}")
        return False
    finally:
        # Clean up test image
        if test_image_path and os.path.exists(test_image_path):
            os.remove(test_image_path)

def main():
    print("🧪 Testing Integration")
    print("=" * 40)
    
    # Test 1: CLI directly
    print("\n1. Testing CLI directly...")
    if not test_cli_directly():
        print("❌ CLI test failed, stopping")
        return False
    
    # Test 2: Backend health
    print("\n2. Testing Backend Health...")
    if not test_backend_health():
        print("❌ Backend not available, stopping")
        return False
    
    # Test 3: Initial wardrobe count
    print("\n3. Testing Initial Wardrobe...")
    initial_count = test_wardrobe_endpoints()
    
    # Test 4: Upload integration
    print("\n4. Testing Upload Integration...")
    new_item_id = test_upload_integration()
    if not new_item_id:
        print("❌ Upload integration failed")
        return False
    
    # Test 5: Verify new item appears
    print("\n5. Verifying New Item...")
    time.sleep(1)  # Give backend time to process
    final_count = test_wardrobe_endpoints()
    
    if final_count > initial_count:
        print(f"✅ New item added successfully! Count: {initial_count} → {final_count}")
    else:
        print(f"⚠️  Item count unchanged: {initial_count} → {final_count}")
    
    print("\n" + "=" * 40)
    print("🎉 Integration test completed!")
    return True

if __name__ == "__main__":
    main()
