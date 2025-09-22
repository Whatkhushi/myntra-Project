#!/usr/bin/env python3
"""
Test CORS configuration for the Wardrobe API
"""
import requests

def test_cors_headers():
    """Test that CORS headers are properly set"""
    print("Testing CORS configuration...")
    
    # Test OPTIONS request (preflight)
    try:
        response = requests.options(
            "http://localhost:5000/api/wardrobe/upload",
            headers={
                "Origin": "http://localhost:8080",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        
        print(f"OPTIONS request status: {response.status_code}")
        print("CORS Headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
        
        # Check if CORS headers are present
        cors_headers = [h for h in response.headers.keys() if 'access-control' in h.lower()]
        if cors_headers:
            print("✅ CORS headers found!")
        else:
            print("❌ No CORS headers found")
            
    except Exception as e:
        print(f"❌ CORS test failed: {e}")

def test_health_with_cors():
    """Test health endpoint with CORS"""
    try:
        response = requests.get(
            "http://localhost:5000/api/health",
            headers={"Origin": "http://localhost:8080"}
        )
        
        print(f"\nHealth check status: {response.status_code}")
        print("Response headers:")
        for header, value in response.headers.items():
            if 'access-control' in header.lower():
                print(f"  {header}: {value}")
                
    except Exception as e:
        print(f"❌ Health check failed: {e}")

if __name__ == "__main__":
    print("CORS Configuration Test")
    print("=" * 30)
    test_cors_headers()
    test_health_with_cors()
    print("\nIf you see CORS headers above, the configuration is working!")
